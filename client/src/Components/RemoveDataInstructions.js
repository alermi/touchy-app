import React from "react";
import Banner from "./Banner";
export default function RemoveDataInstructions() {
  return (
    <>
      <Banner />
      <div
        style={{
          maxWidth: "100%",
          height: "100%",
          textAlign: "center",
          backgroundColor: "white",
          overflowX: "hidden",
          overflowY: "scroll",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          whiteSpace: "pre-line",
        }}
      >
        <div
          style={{
            textAlign: "start",
            backgroundColor: "white",
            color: "black",
            width: "80%",
          }}
        >
          <h1>Deleting Data</h1>
          In order to delete your user data, please follow these steps:
          <ul>
            <li>
              If you are currently not logged in, navigate to the HOME tab using
              the hamburger menu at the top left and log in.
            </li>
            <li>
              Click on the Delete Account item at the bottom of the hamburger
              menu
            </li>
            <li>Click on the "Delete Data" button.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
