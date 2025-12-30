import { useForm } from "react-hook-form";
import "../css/Register.css";

const Register = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="box">
      <h2>Register</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          className="input"
          placeholder="Name"
          {...register("name",{required:"Name is required"})}
        />

        <input
          className="input"
          placeholder="Email"
          {...register("email",{required:"Email is required"})}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          {...register("password",{required:"Password is required"})}
        />

        <button className="button" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Register;
