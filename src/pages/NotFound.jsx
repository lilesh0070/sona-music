import { Link } from "react-router-dom";
import { Empty } from "../components/common/UI";
export default function NotFound() {
  return (
    <div className="page">
      <Empty
        title="A little off the beat"
        text="We couldn’t find this page. Let’s get you back to the music."
        action={
          <Link className="button primary" to="/">
            Back to home
          </Link>
        }
      />
    </div>
  );
}
