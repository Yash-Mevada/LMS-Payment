import Razorpay from "razorpay";
import Course from "../model/course.model.js";
import { ApiError } from "../middleware/error.middleware";
import { CoursePurchase } from "../model/coursePurchase.model.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;
    const course = await Course.findOne(userId);
    if (!course) {
      throw new ApiError("Course not found", 404);
    }

    const coursePurchase = new CoursePurchase({
      course: courseId,
      user: userId,
      amount: course.price,
      status: "pending",
    });

    const options = {
      amount: course.amount * 100, // amount in paise
      currency: "INR",
      receipt: `course_${course.id}`,
      notes: {
        course: courseId,
        user: userId,
      },
    };

    const order = await razorpay.orders.create(options);
    coursePurchase.paymentId = order.id;
    new coursePurchase.save();

    res.status(200).json({
      success: true,
      order,
      course: {
        name: course.title,
        description: course.description,
      },
    });
  } catch (error) {}
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = await crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      throw new ApiError("payment Verification failed", 400);
    }

    const purchase = await CoursePurchase.findOne({
      paymentId: razorpay_payment_id,
    });

    if (!purchase) {
      throw new ApiError("Purchase record not fount");
    }

    purchase.status = "completed";
    await purchase.save();

    res.status(200).json({
      success: true,
      message: "payment verify successfully",
      course: purchase.courseId,
    });
  } catch (error) {}
};
