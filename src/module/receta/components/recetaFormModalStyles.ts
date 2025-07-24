export const buttonStyle = { m: 1 };

export const footerBoxStyle = {
  position: "sticky",
  bottom: 0,
  bgcolor: "background.paper",
  zIndex: 2,
  display: "flex",
  justifyContent: "flex-end",
  p: 2,
  borderTop: "1px solid #ccc",
};

export const grillaIngredientesBoxStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  flex: 1,
};

export const headerBoxStyle = {
  position: "sticky",
  top: 0,
  bgcolor: "background.paper",
  zIndex: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  p: 2,
  borderBottom: "1px solid #ccc",
};

export const ingredientesObservacionesBoxStyle = {
  display: "flex",
  width: "100%",
  minHeight: "400px",
  height: "100%",
  maxHeight: "500px",
  flexDirection: "column",
};

export const mainBoxStyle = {
  flexGrow: 1,
  overflow: "auto",
  p: 2,
};

export const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "calc(100% - 4px)", md: "600px" },
  maxWidth: "90vw",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 0,
  overflow: "hidden",
  maxHeight: "90%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 1,
};

export const nombreTextFieldStyle = {
  width: { xs: "100%", md: "60%" },
  mx: { xs: 0, md: 2 },
};

export const observacionesBoxStyle = {
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  mx: 0,
  flex: 1,
  width: "100%",
};

export const observacionesLabelStyle = { mb: { xs: 0, md: 1 } };

export const observacionesTextFieldStyle = {
  flexGrow: 1,
  flex: 1,
  minHeight: 0,
  "& .MuiInputBase-root": {
    height: "100%",
    alignItems: "flex-start",
  },
  "& .MuiInputBase-input": {
    height: "100%",
    overflow: "auto",
  },
};

export const rindeTextFieldStyle = {
  width: {
    xs: "100%",
    md: "calc(100% - (60% + 32px))",
  },
};

export const precioTextFieldStyle = {
  width: {
    xs: "100%",
    md: "calc(100% - (60% + 32px))",
  },
  ml: { xs: 0, md: 2 },
};
