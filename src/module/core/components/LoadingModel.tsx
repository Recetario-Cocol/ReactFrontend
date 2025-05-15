import { Modal, Box, CircularProgress } from "@mui/material";

export default function LoadingModel() {
  return (
    <Modal open={true}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
        }}>
        <CircularProgress />
      </Box>
    </Modal>
  );
}
