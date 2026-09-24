import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  fetchJson,
  filterBangladeshPackages,
  getFirstHighResImage,
} from "../../utils/media";

const formatBDT = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price unavailable";

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
};

const Top = () => {
  const navigate = useNavigate();
  const [topSellings, setTopSellings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadTopBangladeshPackages = async () => {
      setLoading(true);

      try {
        const data = await fetchJson(
          "/api/package/get-packages?sort=packageRating&order=desc&limit=50"
        );

        const localPackages = filterBangladeshPackages(data?.packages || []);
        const selected = [];
        const usedDestinations = new Set();

        for (const packageData of localPackages) {
          if (selected.length >= 4) break;

          const destination = packageData?.packageDestination?.trim();
          const destinationKey = destination?.toLowerCase();

          if (!destination || usedDestinations.has(destinationKey)) continue;

          const image = await getFirstHighResImage(
            packageData?.packageImages || [],
            {
              minWidth: 1200,
              minHeight: 700,
              minAspectRatio: 1.15,
            }
          );

          if (!image) continue;

          usedDestinations.add(destinationKey);
          selected.push({
            id: packageData?._id,
            image,
            destination,
            price:
              packageData?.packageDiscountPrice || packageData?.packagePrice,
            duration:
              Number(packageData?.packageDays) > 0
                ? `${packageData.packageDays} day${packageData.packageDays === 1 ? "" : "s"}`
                : "Flexible duration",
          });
        }

        if (!cancelled) setTopSellings(selected);
      } catch (error) {
        console.error("Failed to load top Bangladesh destinations:", error);
        if (!cancelled) setTopSellings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTopBangladeshPackages();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full mx-auto my-12 px-4 md:px-8">
      <h1 className="text-center text-gray-700 text-2xl font-semibold">
        Top Selling
      </h1>
      <h2 className="my-2 text-center text-gray-900 text-4xl font-bold">
        Bangladesh&apos;s Top Destinations
      </h2>

      {loading && (
        <div className="my-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[430px] rounded-lg bg-slate-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && topSellings.length > 0 && (
        <div className="my-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start justify-center">
          {topSellings.map((item, index) => (
            <motion.button
              type="button"
              key={item.id || `${item.destination}-${index}`}
              className="w-full flex flex-col items-center justify-center rounded-lg cursor-pointer text-left"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.03 }}
              onClick={() => item.id && navigate(`/package/${item.id}`)}
            >
              <div className="w-full h-[300px] md:h-[330px] overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={item.image}
                  className="w-full h-full object-cover"
                  alt={`${item.destination} travel package`}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="flex items-center justify-between gap-3 w-full mt-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.destination}
                </h3>
                <p className="text-base md:text-lg font-bold text-primary">
                  {formatBDT(item.price)}
                </p>
              </div>

              <p className="text-sm text-gray-500 mt-1 mb-3">
                {item.duration}
              </p>
            </motion.button>
          ))}
        </div>
      )}

      {!loading && topSellings.length === 0 && (
        <div className="my-12 text-center text-gray-500">
          No high-resolution Bangladesh destination packages are available yet.
        </div>
      )}
    </section>
  );
};

export default Top;
