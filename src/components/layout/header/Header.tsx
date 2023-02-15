import { buttonStyles } from '@gear-js/ui';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Logo } from './logo';
import { Account } from './account';
import styles from './Header.module.scss';

type Props = {
  isAccountVisible: boolean;
};

function Header({ isAccountVisible }: Props) {
  return (
    <header className={styles.header}>
      <div>
        <Logo />
        <Link
          to="subscription"
          className={clsx(buttonStyles.button, buttonStyles.medium, buttonStyles.primary, styles.link)}>
          My Subscription
        </Link>
      </div>

      {isAccountVisible && <Account />}
    </header>
  );
}

export { Header };
