import { LogBox, StyleSheet } from "react-native";

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

export const calendarStyles = StyleSheet.create({
  container: {
    width: "30%",
    marginVertical: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  dateBox: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  label: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 6,
  },

  date: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});

export const flightCardStyles = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 4,
  },

  airline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export const checkboxStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#333",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

checkmark: {
    width: 6,
    height: 12,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#fff",
    transform: [{ rotate: "45deg" }],
  },

  checkedBox: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },

  tick: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  label: {
    fontSize: 16,
    color: "#333",
  },
});