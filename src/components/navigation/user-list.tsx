'use client';

import * as React from 'react';

import { UserContext } from '../../context/context';

interface AccountSwitcherProps {
  isCollapsed: boolean;
}

import { useTheme } from 'next-themes';
import { TeamSwitcher } from '../team-switcher';

export function AccountSwitcher() {
  const { user, setPermission, urlGeralAdm, setRole, role, loggedIn } =
    React.useContext(UserContext);
  const { theme } = useTheme();

  const teams = [
    {
      name: 'Visitante', // Define o que deseja exibir no campo 'name'
      id: '', // Personalize conforme necessário
      plan: 'Usuário', // Ajuste conforme necessário
    },
    ...(user?.roles?.map((rola) => ({
      name: rola.role_id, // Define o que deseja exibir no campo 'name'
      id: rola.id, // Personalize conforme necessário
      plan: 'Administrativo', // Ajuste conforme necessário
    })) || []), // Garante que 'teams' seja um array vazio caso 'user.roles' seja undefined
  ];

  return <TeamSwitcher teams={teams} />;
}
