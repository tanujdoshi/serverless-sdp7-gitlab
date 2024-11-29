import React from "react";

import { TableContainer, Paper, Typography } from "@mui/material";

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
<Table>
<TableHead>
  <TableRow>
    <TableCell align="center"><strong>User Email</strong></TableCell>
    <TableCell align="center"><strong>Process ID</strong></TableCell>
    <TableCell align="center"><strong>Filename</strong></TableCell>
    <TableCell align="center"><strong>Type</strong></TableCell>
    <TableCell align="center"><strong>Feedback</strong></TableCell>
    <TableCell align="center"><strong>Sentiment</strong></TableCell>
  </TableRow>
</TableHead>

<TableBody>
          {feedbackData.map((feedback, index) => (
            <TableRow key={index}>
              <TableCell align="center">{feedback.userEmail}</TableCell>
              <TableCell align="center">{feedback.process_id}</TableCell>
              <TableCell align="center">{feedback.filename}</TableCell>
              <TableCell align="center">{feedback.type}</TableCell>
              <TableCell align="center">{feedback.feedback}</TableCell>
              <TableCell align="center">
                {feedback.score > 0
                    ? "Positive"
                    : feedback.score < 0
                    ? "Negative"
                    : "Neutral"}
                </TableCell>
            </TableRow>
          ))}
        </TableBody>
        
</Table>
</TableContainer>
  );
};

export default FeedbackTable;
