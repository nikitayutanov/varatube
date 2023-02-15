import { buttonStyles } from '@gear-js/ui';
import clsx from 'clsx';
import { Link, NavLink } from 'react-router-dom';
import { Logo } from './logo';
import { Account } from './account';
import styles from './Header.module.scss';

type Props = {
  isAccountVisible: boolean;
};

function Header({ isAccountVisible }: Props) {
  return (
    <header className={styles.header}>
      <Logo />

      <NavLink
        to="subscription"
        className={clsx(buttonStyles.button, buttonStyles.medium, buttonStyles.secondary, styles.link)}>
        My Subscription
      </NavLink>

      {isAccountVisible && <Account />}
    </header>
  );
}

export { Header };
