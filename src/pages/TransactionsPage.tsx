import ReportPage, {type ReportPageProps} from "pages/ReportPage";

export default function TransactionsPage(props: Omit<ReportPageProps, "kind">) {
  return <ReportPage {...props} kind="transactions" />;
}
