import { Post } from "../modules/Post/Post.model";
import { User } from "../modules/User/user.model";

User.hasMany(Post, {
  foreignKey: "userId",
  as: "posts",
});

Post.belongsTo(User, {
  foreignKey: "userId",
  as: "users",
});
