const User = require("../models/User");
const Interview = require("../models/Interview");

const getAllUsers = async (req, res) => {
  try {
    // Fetch all registered users excluding passwords for security
    const users = await User.find({}).select("-password");
    return res.status(200).json({
      message: "Users fetched successfully.",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

const getAllInterviews = async (req, res) => {
  try {
    // Fetch all interview records, populating associated user name and email
    const interviews = await Interview.find({}).populate(
      "userId",
      "name email"
    );
    return res.status(200).json({
      message: "Interviews fetched successfully.",
      interviews,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch interviews.",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
      userId: id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete user.",
      error: error.message,
    });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Interview ID is required.",
      });
    }

    const deletedInterview = await Interview.findByIdAndDelete(id);

    if (!deletedInterview) {
      return res.status(404).json({
        message: "Interview record not found.",
      });
    }

    return res.status(200).json({
      message: "Interview record deleted successfully.",
      interviewId: id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete interview record.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getAllInterviews,
  deleteUser,
  deleteInterview,
};
