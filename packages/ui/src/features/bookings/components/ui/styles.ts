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
    width: 550,
    height: 370,
    
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

export const locationStyles = StyleSheet.create({
  container: {
    width: "30%",
    position: "relative",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },

  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
  },

  itemText: {
    fontSize: 16,
  },
});