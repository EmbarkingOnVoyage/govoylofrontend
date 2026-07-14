import { StyleSheet } from "react-native";

export const buttonStyles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: "#007AFF",
  },

  secondaryButton: {
    backgroundColor: "#6C757D",
  },

  disabledButton: {
    backgroundColor: "#C4C4C4",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 12,
  },

   inputError: {
    borderColor: "red",
  },

  errorText: {
    color: "red",
    marginTop: 4,
  },
});

export const cardStyles = StyleSheet.create({
  card: {
    width: 500,
    height: 350,
    
    backgroundColor: "#f0eeee",
    borderRadius: 12,
    padding: 60,
    
    shadowColor: "#000",
    shadowOffset: {
      width:0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    
    elevation: 3,
    
    marginVertical: 8,
  },
});