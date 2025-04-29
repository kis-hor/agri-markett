import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import styles from "../styles/styles";
import { categoriesData } from "../static/data";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const categoryData = searchParams.get("category");
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const [data, setData] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    if (categoryData === null) {
      const d = allProducts;
      setData(d);
    } else {
      const d = allProducts && allProducts.filter((i) => i.category === categoryData);
      setData(d);
    }
  }, [allProducts, categoryData]);

  const handleSort = (option) => {
    setSortOption(option);
    let sortedData = [...data];
    
    switch (option) {
      case "priceLowToHigh":
        sortedData.sort((a, b) => a.discountPrice - b.discountPrice);
        break;
      case "priceHighToLow":
        sortedData.sort((a, b) => b.discountPrice - a.discountPrice);
        break;
      case "ratingHighToLow":
        sortedData.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
        break;
      case "newest":
        sortedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        sortedData = [...allProducts];
    }
    
    setData(sortedData);
  };

  const handleFilter = () => {
    let filteredData = [...allProducts];

    // Filter by price range
    filteredData = filteredData.filter(
      (item) => item.discountPrice >= priceRange[0] && item.discountPrice <= priceRange[1]
    );

    // Filter by category
    if (selectedCategory !== "All") {
      filteredData = filteredData.filter((item) => item.category === selectedCategory);
    }

    // Filter by minimum rating
    if (minRating > 0) {
      filteredData = filteredData.filter((item) => (item.ratings || 0) >= minRating);
    }

    setData(filteredData);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <Header activeHeading={3} />
          <br />
          <br />
          <div className={`${styles.section}`}>
            {/* Filters and Sorting Section */}
            <div className="w-full flex flex-wrap justify-between items-center mb-8 p-4 bg-white rounded-md shadow-sm">
              {/* Category Filter */}
              <div className="mb-4 800px:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-[200px] h-[40px] border border-gray-300 rounded-md px-2"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categoriesData.map((category) => (
                    <option key={category.title} value={category.title}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-4 800px:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="w-[100px] h-[40px] border border-gray-300 rounded-md px-2"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    className="w-[100px] h-[40px] border border-gray-300 rounded-md px-2"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-4 800px:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <select
                  className="w-[200px] h-[40px] border border-gray-300 rounded-md px-2"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                >
                  <option value={0}>All Ratings</option>
                  <option value={4}>4+ Stars</option>
                  <option value={3}>3+ Stars</option>
                  <option value={2}>2+ Stars</option>
                  <option value={1}>1+ Stars</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="mb-4 800px:mb-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  className="w-[200px] h-[40px] border border-gray-300 rounded-md px-2"
                  value={sortOption}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="priceLowToHigh">Price: Low to High</option>
                  <option value="priceHighToLow">Price: High to Low</option>
                  <option value="ratingHighToLow">Rating: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Apply Filters Button */}
              <button
                className="bg-[#f63b60] text-white px-4 py-2 rounded-md h-[40px]"
                onClick={handleFilter}
              >
                Apply Filters
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
              {data && data.map((i, index) => <ProductCard data={i} key={index} />)}
            </div>
            {data && data.length === 0 ? (
              <h1 className="text-center w-full pb-[100px] text-[20px]">
                No products Found!
              </h1>
            ) : null}
          </div>
          <Footer />
        </div>
      )}
    </>
  );
};

export default ProductsPage;
