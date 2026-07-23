import ReportPage from 'pages/ReportPage';
import type {ReportPageProps} from "common/interfaces/report";

export default function PayoutsPage(props: Omit<ReportPageProps, 'kind'>) {
  return <ReportPage {...props} kind="payouts" />;
}
