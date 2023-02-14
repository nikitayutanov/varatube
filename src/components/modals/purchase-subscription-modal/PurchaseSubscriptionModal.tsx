import { Button, Modal, Select } from '@gear-js/ui';
import { useForm } from '@mantine/form';
import styles from './PurchaseSubscriptionModal.module.scss';

const options = [
  { label: 'None', value: '' },
  { label: '5 minutes', value: '5' },
];

const initialValues = { renewal: options[0].value };

function PurchaseSubscriptionModal() {
  const { getInputProps } = useForm({ initialValues });

  return (
    <Modal heading="Purchase subscription" close={() => {}}>
      <form className={styles.form}>
        <Select label="Auto-renewal" options={options} {...getInputProps('renewal')} />
        <Button type="submit" text="Purchase subscription" />
      </form>
    </Modal>
  );
}

export { PurchaseSubscriptionModal };
