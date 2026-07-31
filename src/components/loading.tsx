// LoadingWrapper.tsx
import React, { useState, useEffect, useContext } from 'react';
import { LogoConectee } from './svg/LogoConectee';
import { UserContext } from '../context/context';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { LogoIapos } from './svg/LogoIapos';

interface LoadingWrapperProps {
    children: React.ReactNode;
}

interface Uid {
    uid: string
    provider: string
    displayName: string
    email: string
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);

    const { setLoggedIn, setUser, urlGeralAdm, setPermission, permission, setRole, version } = useContext(UserContext)
    const [uid, setUid] = useState<Uid | null>(null);

    ///// LOGIN SHIBBOLETH
    useEffect(() => {
        setLoading(true);

        const storedPermission = localStorage.getItem('permission');
        if (storedPermission) {
            setPermission(JSON.parse(storedPermission));
        }

        const handleLoginMinhaUfmg = async () => {
            try {
                const urlProgram = `${urlGeralAdm}s/ufmg/user`;
                const urlUser = `${urlGeralAdm}s/user?uid=${uid}`;

                const fetchData = async () => {
                    try {
                        const response = await fetch(urlProgram, {
                            method: 'GET',
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        const data = await response.json();

                        if (data && Array.isArray(data) && data.length > 0) {
                            setUid(data[0].uid);
                            fetchDataLogin();
                        } else {

                        }
                    } catch (err) {
                    }
                };

                const fetchDataLogin = async () => {
                    try {
                        const response = await fetch(urlUser, {
                            method: 'GET',
                            mode: 'cors',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });

                        const data = await response.json();
                        if (data && Array.isArray(data) && data.length > 0) {
                            data[0].roles = data[0].roles || [];
                            setUser(data[0]);
                            setLoggedIn(true);

                            const storedUser = localStorage.getItem('permission');
                            const storedRole = localStorage.getItem('role');

                            if (storedUser) {
                                setPermission(JSON.parse(storedUser));
                            }

                            if (storedRole) {
                                setRole(JSON.parse(storedRole));
                            }

                            setTimeout(() => {
                                setLoading(false);
                            }, 2000);
                        }
                    } catch (err) {
                    }
                };

                fetchData();
            } catch (error) {
            }
        };

        handleLoginMinhaUfmg();
    }, [uid]);

    /// LOGIN FIRE
    useEffect(() => {
        setLoading(true);

        const storedPermission = localStorage.getItem('permission');
        if (storedPermission) {
            setPermission(JSON.parse(storedPermission));
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                if (firebaseUser.uid !== '') {

                    const urlUser = `${urlGeralAdm}s/user?uid=${firebaseUser.uid}`;

                    const fetchData = async () => {
                        try {
                            const response = await fetch(urlUser, {
                                mode: 'cors',
                                headers: {
                                    'Access-Control-Allow-Origin': '*',
                                    'Access-Control-Allow-Methods': 'GET',
                                    'Access-Control-Allow-Headers': 'Content-Type',
                                    'Access-Control-Max-Age': '3600',
                                    'Content-Type': 'text/plain',
                                },
                            });
                            const data = await response.json();
                            if (data && Array.isArray(data) && data.length > 0) {
                                setLoggedIn(true)
                                data[0].roles = data[0].roles || [];
                                setUser(data[0]);

                                const storedUser = localStorage.getItem('permission');
                                const storedRole = localStorage.getItem('role');

                                if (storedUser) {
                                    setPermission(JSON.parse(storedUser));
                                }

                                if (storedRole) {
                                    setRole(JSON.parse(storedRole));
                                }

                                setTimeout(() => {
                                    setLoading(false);
                                }, 2000);
                            }
                        } catch (err) {
                        } finally {
                            setTimeout(() => {
                                setLoading(false);
                            }, 2000);
                        }
                    };

                    fetchData();
                } else {
                    setLoggedIn(false);
                    setTimeout(() => {
                        setLoading(false);
                    }, 2000); 
                }
            } else {
                setLoggedIn(false);
                setTimeout(() => {
                    setLoading(false);
                }, 2000); 
            }

            setTimeout(() => {
                setLoading(false);
            }, 2000); 
        });

        return () => {
            unsubscribe();
        };

    }, []);

    return <>{loading ? <main className='h-screen w-full flex items-center justify-center bg-neutral-50'>
        <div className='h-16 animate-pulse'>
            {version ? (
                <div className="h-16"><LogoConectee /></div>
            ) : (
                <div className="h-16"><LogoIapos /></div>
            )}
        </div>
    </main> : children}</>;
};

export default LoadingWrapper;