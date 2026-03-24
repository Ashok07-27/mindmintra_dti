function getEmergencyResources(req, res) {
  res.json({
    emergencyContacts: [
      {
        title: "Local Emergency Services",
        description: "If someone is in immediate danger, contact local emergency services right away.",
      },
      {
        title: "Campus Counselor",
        description: "Reach out to your college counseling center for ongoing professional support.",
      },
      {
        title: "Trusted Adult or Faculty Mentor",
        description: "When risk is high, encourage students to connect with a trusted person offline too.",
      },
    ],
  });
}

module.exports = { getEmergencyResources };



