const Council = require('../model/council.model.js')
const mongoose = require('mongoose');

// const createCouncil = async (req, res) => {
//     try {
//         const council = await Council.create(req.body);
//         res.status(200).json(council);
//     } catch(error){
//         res.status(500).json({message: error.message})
//     }
// }

const getCouncil = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const council = await Council.find({}, '-password').sort({ createdAt: -1 }).lean()
    .lean().populate('founderNames', '_id firstName lastName suffix alexis')

    res.status(200).json({
      message: "Success",
      result: true,
      data: council
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      result: false,
      error: error.message
    });
  }
};

const createCouncil = async (req, res) => {
  try {
    const { name, founderNames, foundDate, status, locationAddress, verifiedBy, displayPic } = req.body;

    // 2️⃣ Create and save chapter
    const council = new Council({
      name,
      foundDate,
      status,
      locationAddress,
      founderNames,  
      verifiedBy,
      displayPic,
    });

    await council.save();

    return res.status(201).json({
      message: "Council created successfully.",
      result: true,
      data: council,
    });

  } catch (error) {
    console.error("❌ Error creating chapter:", error);

    // 4️⃣ Always return after sending a response
    return res.status(500).json({
      message: "Error creating chapter",
      error: error.message,
    });
  }
};


// const getUser = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const user = await User.findById(id)
//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).json({message: error.message})
//     }
// }

// const updateUser = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const user = await User.findByIdAndUpdate(id, req.body);
//         if(!user) {
//             return res.status(404).json({message: "User not found"});
//         }
//         const updateUser = await User.findById(id);
//         res.status(200).json(updateUser);

//     } catch (error) {
//         res.status(500).json({message: error.message})
//     }
// }

// const deleteUser = async (req, res) => {
//     try {
//         const {id} = req.params;
//         const user = await User.findByIdAndDelete(id, req.body);
//         if(!user) {
//             return res.status(404).json({message: "User not found"});
//         }
//         res.status(200).json({message: "User Deleted Successfully"});

//     } catch (error) {
//         res.status(500).json({message: error.message})
//     }
// }

const updateCouncil = async (req, res) => {
    try {
        const {id} = req.params;
        const council = await Council.findByIdAndUpdate(id, req.body);
        if(!council) {
            return res.status(404).json({message: "council not found"});
        }
        const updateCouncil = await Council.findById(id);
        res.status(200).json(updateCouncil);

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const getCouncilById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ result: false, message: 'Invalid Council ID' });
    }

    // Fetch single user, exclude password, populate council
    const council = await Council.findById(id, '-password')
      .lean().populate('founderNames', '_id firstName lastName suffix alexis')

    if (!council) {
      return res.status(404).json({ result: false, message: 'Council not found' });
    }

    res.json({
      result: true,
      message: 'Success',
      data: council
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: err.message });
  }
};

const deleteCouncil = async (req, res) => {
    try {
        const {id} = req.params;
        const council = await Council.findByIdAndDelete(id, req.body);
        if(!council) {
            return res.status(404).json({message: "council not found"});
        }
        res.status(200).json({message: "council Deleted Successfully"});

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}


module.exports = {
    getCouncil,
    createCouncil,
    deleteCouncil,
    getCouncilById,
    updateCouncil
}