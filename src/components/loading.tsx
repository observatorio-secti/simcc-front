// LoadingWrapper.tsx
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/context';
import { useTheme } from 'next-themes';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { LogoIapos } from './svg/LogoIapos';
import { LogoIaposWhite } from './svg/LogoIaposWhite';

interface LoadingWrapperProps {
  children: React.ReactNode;
}

interface Uid {
  uid: string;
  provider: string;
  displayName: string;
  email: string;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const {
    setLoggedIn,
    setUser,
    urlGeralAdm,
    setPermission,
    permission,
    setRole,
  } = useContext(UserContext);
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
              setUid(data[0].uid); // setUid agora usa o valor da uid
              fetchDataLogin();
            } else {
            }
          } catch (err) {}
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

              setLoading(false);
            } else {
              setLoading(false);
            }
          } catch (err) {
            setLoading(false);
          }
        };

        fetchData();
      } catch (error) {}
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

    // Segurança: se o Firebase não responder, libera a tela mesmo assim.
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(safetyTimeout);
      if (firebaseUser) {
        if (firebaseUser.uid !== '') {
          // Recupera as informações adicionais do seu banco de dados aqui
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
                setLoggedIn(true);
                data[0].roles = data[0].roles || [];
                setUser(data[0]);

                const storedUser = localStorage.getItem('permission');
                const storedRole = localStorage.getItem('role');

                if (storedUser) {
                  // Se as informações do usuário forem encontradas no armazenamento local, defina o usuário e marque como autenticado
                  setPermission(JSON.parse(storedUser));
                }

                if (storedRole) {
                  // Se as informações do usuário forem encontradas no armazenamento local, defina o usuário e marque como autenticado
                  setRole(JSON.parse(storedRole));
                }

                setLoading(false);
              } else {
                setLoading(false);
              }
            } catch (err) {
              setLoading(false);
            }
          };

          fetchData();
        } else {
          setLoggedIn(false);
          setLoading(false);
        }
      } else {
        setLoggedIn(false);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, []);

  const { theme } = useTheme();

  return (
    <>
      {loading ? (
        <main className="h-screen w-full flex items-center justify-center">
          <div className="h-16 animate-pulse">
            <div className="h-16  ">
              {theme == 'dark' ? <LogoIaposWhite /> : <LogoIapos />}
            </div>
          </div>
        </main>
      ) : (
        children
      )}
    </>
  );
};

export default LoadingWrapper;
