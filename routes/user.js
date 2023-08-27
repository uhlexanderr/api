const req = require("express/lib/request");
const User = require("../models/User");
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();


//update
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    if(req.body.password) {
       req.body.password = CryptoJS.AES.encrypt(
        req.body.password, 
         process.env.PASS_SEC
        ).toString();
    }

    try{
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            {
            $set: req.body,
            },  
            { new: true }
            );
            res.status(200).json(updatedUser);
    } catch (err) { 
        res.status(500).json(err);
    }
});

//delete
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted!" );
    } catch (err) {
        res.status(500).json(err);
    }


});
//get user
router.get("/find/:id", async (req, res) => {
    try {
     const user = await User.findById(req.params.id);
     const { password, ...others } = user._doc;
     res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }

});

//get all users
router.get("/", async (req, res) => {
    const query = req.query.new
    try {
     const users = query 
     ? await User.find().sort({_id:-1}).limit(5) 
     : await User.find();
     res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }

});

//get user stats
router.get("/stats", async (req, res) => {
    const date = new Date();
    const lastThreeMonths = new Date(date.setMonth(date.getMonth() - 3));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastThreeMonths } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 },
                },
            }
        ]);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get users registered by month and year
router.get("/registered-by-month-year", async (req, res) => {
    try {
        const data = await User.aggregate([
            {
                $project: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    total: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                },
            },
        ]);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;