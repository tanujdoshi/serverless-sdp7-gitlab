import React from "react";


const FeedbackTable = () => {

  const [feedbackData, setFeedbackData] = useState([]);

  useEffect(()=>{
    console.log("Feedback Data");
    console.log(feedbackData);
    axios.get("https://getfeedbackdetails-710015716338.us-central1.run.app")
    .then((res)=>{
        setFeedbackData(res.data);
    })
    .catch((err)=>{ console.log(err); });
  },[])
  return (
    <h1>Feedback Table</h1>
  );
};

export default FeedbackTable;
