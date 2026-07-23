import SharedLayout from 'layouts/SharedLayout';
import type {SharedLayoutProps} from "common/interfaces/layouts";

export default function AdminLayout(props: SharedLayoutProps) {
  return <SharedLayout {...props} />;
}
