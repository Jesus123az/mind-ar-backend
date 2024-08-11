import mongoose from "mongoose";

const {Schema } = mongoose

let User;

if (mongoose.models.User) {
  User = mongoose.model("User");
} else {
  const UserSchema = new Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        healthInfo: {type: Schema.ObjectId, ref: "healthInfo" , default: null, required: false},
    },
    { timestamps: true }
  );

  User = mongoose.model("User", UserSchema);
}

export default User;
