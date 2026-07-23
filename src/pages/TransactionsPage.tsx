import ReportPage from 'pages/ReportPage';
import type {ReportPageProps} from "common/interfaces/report";

export default function TransactionsPage(props: Omit<ReportPageProps, 'kind'>) {
  return <ReportPage {...props} kind="transactions" />;
}
