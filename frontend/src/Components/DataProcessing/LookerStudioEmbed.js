import React from "react";
import { Button } from "@mui/material";

const LookerStudioEmbed = ({ email }) => {
  const reportBaseUrl =
    "https://lookerstudio.google.com/embed/u/0/reporting/88fc2f1c-b5a5-4eee-951c-967b334e6f24/page/3sfSE";

  // Encode the email parameter
  const encodedParams = encodeURIComponent(JSON.stringify({ email }));
  const reportUrl = `${reportBaseUrl}?params=${encodedParams}&refresh=1`;

  const handleOpenInNewTab = () => {
    const newTab = window.open();
    newTab.document.body.innerHTML = `
      <iframe 
        src="${reportUrl}" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        style="border: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;">
      </iframe>
    `;
  };

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenInNewTab}
        sx={{ textTransform: "none", marginBottom: 2 }}
      >
        Open Report in New Tab
      </Button>
      {/* <iframe
        src={reportUrl}
        width="100%"
        height="600"
        frameBorder="0"
        allowFullScreen
        title="Looker Studio Report"
      /> */}
    </div>
  );
};

export default LookerStudioEmbed;
