import ReportPage, {type ReportPageProps} from "pages/ReportPage";

export default function PayoutsPage(props: Omit<ReportPageProps, "kind">) {
  return <ReportPage {...props} kind="payouts" />;
}
