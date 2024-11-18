import React from "react";

const LookerStudioEmbed = ({ email }) => {
  const reportBaseUrl =
    "https://lookerstudio.google.com/embed/u/0/reporting/88fc2f1c-b5a5-4eee-951c-967b334e6f24/page/3sfSE";

  // Encode the email parameter
  const encodedParams = encodeURIComponent(JSON.stringify({ email }));

  const reportUrl = `${reportBaseUrl}?params=${encodedParams}`;

  return (
    <iframe
      src={reportUrl}
      width="100%"
      height="600"
      frameBorder="0"
      allowFullScreen
      title="Looker Studio Report"
    />
  );
};

export default LookerStudioEmbed;
