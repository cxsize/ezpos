import { Redirect } from 'expo-router';
import { useSession } from '~/state/session';

export default function Index() {
  const cashier = useSession((s) => s.cashier);
  return <Redirect href={cashier ? '/sale' : '/signin'} />;
}
