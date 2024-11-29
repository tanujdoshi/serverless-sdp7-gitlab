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
    <TableContainer component={Paper} sx={{ maxWidth: 800, margin: "auto", mt: 4 }}>
      <Typography variant="h5" align="center" mt={2}>
        Feedback Results
      </Typography>
    </TableContainer>
  );
};

export default FeedbackTable;
