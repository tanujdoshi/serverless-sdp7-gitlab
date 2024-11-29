import {React} from "react";

const FeedbackForm = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {  
    e.preventDefault();
    const {process_id, filename, type} = selectedTask;
    axios
    .post("https://us-central1-serverless-pro-442123.cloudfunctions.net/feedd3", {
      userEmail: userEmail,
      process_id,
      fileName:filename,
      dpType:type,
      feed:feedback,
    },{
        headers: {
            "Content-Type": "application/json",
        },
    })
    .then(() => alert("Feedback submitted!"))
    .catch((error) => console.error(error));
  };

    return(
      <div style={{padding:"40px"}}>
          <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          Submit
        </Button>
      </div>
    )

}

export default FeedbackForm;