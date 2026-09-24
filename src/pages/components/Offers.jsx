import { FaClock } from "react-icons/fa";
import { Link } from "react-router-dom";
const Offers = ({ packageData }) => {
  return (
    <div className="w-[260px] flex flex-col gap-2 items-center bg-white rounded-md py-2 shadow-sm transition-transform duration-300 hover:scale-105">
      <div>
        <Link
          to={`/package/${packageData._id}`}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
        <img 
          src={
            packageData?.packageImages[0]?.startsWith("http") 
              ? packageData.packageImages[0] 
              : `http://localhost:8000/images/${packageData.packageImages[0]}`
          } 
          alt="Package Image" 
          // Keep your existing className here
        />
        </Link>
      </div>
      <p>
        {packageData.offer && packageData.packageDiscountPrice ? (
          <p className=" text-sm">
            <span className="line-through text-gray-700">
              ${packageData.packagePrice}
            </span>
            -
            <span className="text-sm ">
              ${packageData.packageDiscountPrice}
            </span>
          </p>
        ) : (
          <p className="text-sm">${packageData.packagePrice}</p>
        )}
      </p>
      <div>
        <h1 className="text-[#EB662B]">{packageData.packageName}</h1>
        <p className="text-center">{packageData.packageDestination}</p>
      </div>
      <p>
        {" "}
        {(+packageData.packageDays > 0 || +packageData.packageNights > 0) && (
          <p className="flex text-sm items-center gap-2 text-[#EB662B]">
            <FaClock />
            {+packageData.packageDays > 0 &&
              (+packageData.packageDays > 1
                ? packageData.packageDays + " Days"
                : packageData.packageDays + " Day")}
            {+packageData.packageDays > 0 &&
              +packageData.packageNights > 0 &&
              " - "}
            {+packageData.packageNights > 0 &&
              (+packageData.packageNights > 1
                ? packageData.packageNights + " Nights"
                : packageData.packageNights + " Night")}
          </p>
        )}
      </p>
    </div>
  );
};
export default Offers;
