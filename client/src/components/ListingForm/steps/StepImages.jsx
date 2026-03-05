import PropTypes from "prop-types";

const StepImages = ({
  existingImages,
  newFiles,
  MAX_IMAGES,
  totalImages,
  removeExistingImage,
  removeNewFile,
  fileInputRef,
  handleFileChange,
}) => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
            Upload Photos
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            Show your bike to the world
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="bike-photos"
          className="font-bold text-gray-900 dark:text-white"
        >
          Bike Photos * (Max {MAX_IMAGES})
        </label>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          High-quality photos increase your chances of selling. Show the bike
          from different angles and any wear/damage.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {existingImages.map((url, index) => (
            <div
              key={`existing-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-gray-100 dark:border-dark-border group group-hover:border-emerald-200"
            >
              <img
                src={url}
                alt={`Existing ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:bg-red-600 hover:scale-105 active:scale-90 transition-all sm:opacity-0 sm:group-hover:opacity-100 opacity-100 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  removeExistingImage(index);
                }}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}

          {newFiles.map((item, index) => (
            <div
              key={`new-${index}`}
              className="relative aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-emerald-500 focus-within:ring-2 group"
            >
              <img
                src={item.previewUrl}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md hover:bg-red-600 hover:scale-105 active:scale-90 transition-all sm:opacity-0 sm:group-hover:opacity-100 opacity-100 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNewFile(index);
                }}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}

          {totalImages < MAX_IMAGES && (
            <button
              type="button"
              className="aspect-square bg-gray-50 hover:bg-emerald-50 dark:bg-dark-input dark:hover:bg-dark-border border-2 border-dashed border-gray-300 hover:border-emerald-500 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-emerald-500 transition-all gap-2 group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-4xl leading-none group-hover:scale-110 transition-transform">
                +
              </span>
              <span className="font-semibold text-sm">Add Photo</span>
            </button>
          )}
        </div>
        <input
          id="bike-photos"
          name="bike-photos"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
          multiple
          accept="image/*"
        />
      </div>
    </div>
  );
};

StepImages.propTypes = {
  existingImages: PropTypes.array.isRequired,
  newFiles: PropTypes.array.isRequired,
  MAX_IMAGES: PropTypes.number.isRequired,
  totalImages: PropTypes.number.isRequired,
  removeExistingImage: PropTypes.func.isRequired,
  removeNewFile: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  handleFileChange: PropTypes.func.isRequired,
};

export default StepImages;
