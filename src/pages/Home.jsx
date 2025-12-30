import "../css/home.css";
import pet from "../assets/images/pet.jpg"; 

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        {/* LEFT CONTENT */}
        <div className="hero-text">
          <span className="badge">Find your new friend</span>

          <h1>
            Stress-free <br /> Pet Adoption
          </h1>

          <p>
            Adopt loving dogs and cats nearby.
            Give them a forever home today.
          </p>

          <button className="btn-primary">Adopt Now</button>
        </div>

        <div className="hero-image">
        
          <img
            src={pet}
            alt="Pets"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
