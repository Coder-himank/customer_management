import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "@/styles/GiftManagement.module.css";
import { useRouter } from "next/router";
export default function GiftsPage() {
  const [gifts, setGifts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [targets, setTargets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingGift, setEditingGift] = useState(null);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);


  const router = useRouter();

  const videoRef = useRef(null);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    customerId: "",
    targetId: "",
    name: "",
    quantity: 1,
    estimatedValue: "",
    givenDate: new Date().toISOString().split("T")[0],
    occasion: "customer_reward",
    notes: "",
    receiverPhoto: "",
  });

  /* =====================================================
     LOAD INITIAL DATA
  ===================================================== */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [giftsResponse, customersResponse] = await Promise.all([
        axios.get("/api/gifts"),
        axios.get("/api/customers"),
      ]);

      const giftsData =
        giftsResponse.data?.gifts ||
        [];

      const customersData =
        customersResponse.data?.customers ||
        customersResponse.data ||
        [];

      setGifts(Array.isArray(giftsData) ? giftsData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (error) {
      console.error("Failed to load data:", error);

      alert(
        error.response?.data?.error ||
        "Failed to load gifts and customers"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     LOAD TARGETS FOR CUSTOMER
  ===================================================== */

  const loadTargets = async (customerId) => {
    if (!customerId) {
      setTargets([]);
      return;
    }

    try {
      const response = await axios.get(
        `/api/targets`
      );

      const data =
        response.data?.data ||
        response.data ||
        [];

      setTargets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load targets:", error);
      setTargets([]);

      alert(
        error.response?.data?.error ||
        "Failed to load customer targets"
      );
    }
  };

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =====================================================
     CUSTOMER CHANGE
  ===================================================== */

  const handleCustomerChange = async (e) => {
    const customerId = e.target.value;

    setForm((prev) => ({
      ...prev,
      customerId,
      targetId: "",
    }));

    setTargets([]);

    if (customerId) {
      await loadTargets(customerId);
    }
  };

  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  const openAddModal = () => {
    setEditingGift(null);

    setForm({
      customerId: "",
      targetId: "",
      name: "",
      quantity: 1,
      estimatedValue: "",
      givenDate: new Date().toISOString().split("T")[0],
      occasion: "customer_reward",
      notes: "",
      receiverPhoto: "",
    });

    setTargets([]);
    setPhotoFile(null);
    setPhotoPreview("");

    setShowModal(true);
  };

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  const openEditModal = async (gift) => {
    setEditingGift(gift);

    const formattedDate = gift.givenDate
      ? new Date(gift.givenDate)
        .toISOString()
        .split("T")[0]
      : new Date().toISOString().split("T")[0];

    const customerId =
      typeof gift.customerId === "object"
        ? gift.customerId?._id
        : gift.customerId;

    const targetId =
      typeof gift.targetId === "object"
        ? gift.targetId?._id
        : gift.targetId || "";

    setForm({
      customerId: customerId || "",
      targetId: targetId || "",
      name: gift.name || "",
      quantity: gift.quantity || 1,
      estimatedValue: gift.estimatedValue || "",
      givenDate: formattedDate,
      occasion: gift.occasion || "customer_reward",
      notes: gift.notes || "",
      receiverPhoto: gift.receiverPhoto || "",
    });

    setPhotoFile(null);
    setPhotoPreview(gift.receiverPhoto || "");

    setShowModal(true);

    if (customerId) {
      await loadTargets(customerId);
    } else {
      setTargets([]);
    }
  };

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingGift(null);

    setPhotoFile(null);
    setPhotoPreview("");

    setTargets([]);
  };

  /* =====================================================
     PHOTO CHANGE
  ===================================================== */

  const openCamera = async () => {
    try {
      setCameraLoading(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        alert(
          "Your browser does not support camera access."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
          },
          audio: false,
        });

      setCameraStream(stream);
      setShowCamera(true);

      // Wait until video element exists
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);

    } catch (error) {
      console.error("Camera error:", error);

      if (error.name === "NotAllowedError") {
        alert(
          "Camera permission was denied. Please allow camera access in your browser."
        );
      } else if (error.name === "NotFoundError") {
        alert(
          "No camera was found on this device."
        );
      } else {
        alert(
          "Unable to access the camera."
        );
      }
    } finally {
      setCameraLoading(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;

    if (!video) return;

    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File(
          [blob],
          `gift-${Date.now()}.jpg`,
          {
            type: "image/jpeg",
          }
        );

        setPhotoFile(file);

        setPhotoPreview(
          URL.createObjectURL(file)
        );

        closeCamera();
      },
      "image/jpeg",
      0.9
    );
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream
        .getTracks()
        .forEach((track) => track.stop());
    }

    setCameraStream(null);
    setShowCamera(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB.");
      return;
    }

    setPhotoFile(file);

    const previewUrl = URL.createObjectURL(file);

    setPhotoPreview(previewUrl);
  };

  /* =====================================================
     UPLOAD PHOTO
  ===================================================== */

  const uploadPhoto = async () => {
    if (!photoFile) {
      return form.receiverPhoto || "";
    }

    const formData = new FormData();

    formData.append("file", photoFile);
    formData.append("folder", "tradeintel/gifts");

    try {
      const response = await axios.post(
        "/api/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Supports both possible response formats
      const uploadedUrl =
        response.data?.data?.url ||
        response.data?.url ||
        "";

      if (!uploadedUrl) {
        throw new Error("Upload URL was not returned.");
      }

      return uploadedUrl;
    } catch (error) {
      console.error("Photo upload failed:", error);

      throw new Error(
        error.response?.data?.error ||
        "Failed to upload photo"
      );
    }
  };

  /* =====================================================
     SUBMIT FORM
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerId) {
      alert("Please select a customer.");
      return;
    }

    if (!form.name.trim()) {
      alert("Please enter the gift name.");
      return;
    }

    if (!form.quantity || Number(form.quantity) < 1) {
      alert("Quantity must be at least 1.");
      return;
    }

    try {
      setSubmitting(true);

      let photoUrl = form.receiverPhoto || "";

      // Upload only when a new photo is selected
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      const payload = {
        customerId: form.customerId,
        targetId: form.targetId || null,

        name: form.name.trim(),

        quantity: Number(form.quantity),

        estimatedValue: form.estimatedValue
          ? Number(form.estimatedValue)
          : 0,

        receiverPhoto: photoUrl,

        givenDate: form.givenDate
          ? new Date(form.givenDate)
          : new Date(),

        occasion: form.occasion,

        notes: form.notes.trim(),
      };

      if (editingGift) {
        await axios.put(
          `/api/gifts/${editingGift._id}`,
          payload
        );

        alert("Gift updated successfully.");
      } else {
        await axios.post(
          "/api/gifts",
          payload
        );

        alert("Gift added successfully.");
      }

      closeModal();

      await loadData();
    } catch (error) {
      console.error("Gift save error:", error);

      alert(
        error.response?.data?.error ||
        error.message ||
        "Failed to save gift"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     DELETE GIFT
  ===================================================== */

  const deleteGift = async (giftId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this gift record?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/gifts/${giftId}`);

      alert("Gift deleted successfully.");

      await loadData();
    } catch (error) {
      console.error("Delete gift error:", error);

      alert(
        error.response?.data?.error ||
        "Failed to delete gift"
      );
    }
  };

  /* =====================================================
     FILTER GIFTS
  ===================================================== */

  const filteredGifts = gifts.filter((gift) => {
    const customerName =
      typeof gift.customerId === "object"
        ? gift.customerId?.name || ""
        : "";

    const customerPhone =
      typeof gift.customerId === "object"
        ? gift.customerId?.phone || ""
        : "";

    const giftName = gift.name || "";

    const searchText = search.toLowerCase();

    return (
      customerName
        .toLowerCase()
        .includes(searchText) ||
      String(customerPhone)
        .toLowerCase()
        .includes(searchText) ||
      giftName
        .toLowerCase()
        .includes(searchText)
    );
  });

  /* =====================================================
     CUSTOMER DISPLAY
  ===================================================== */

  const getCustomerName = (gift) => {
    if (
      gift.customerId &&
      typeof gift.customerId === "object"
    ) {
      return gift.customerId.name || "Unknown Customer";
    }

    const customer = customers.find(
      (c) => c._id === gift.customerId
    );

    return customer?.name || "Unknown Customer";
  };

  const getCustomerPhone = (gift) => {
    if (
      gift.customerId &&
      typeof gift.customerId === "object"
    ) {
      return gift.customerId.phone || "";
    }

    const customer = customers.find(
      (c) => c._id === gift.customerId
    );

    return customer?.phone || "";
  };

  const getTargetName = (gift) => {
    if (
      gift.targetId &&
      typeof gift.targetId === "object"
    ) {
      return gift.targetId.name || "No Target";
    }

    return "No Target";
  };

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     OCCASION LABEL
  ===================================================== */

  const getOccasionLabel = (occasion) => {
    const occasions = {
      diwali: "Diwali",
      holi: "Holi",
      new_year: "New Year",
      birthday: "Birthday",
      anniversary: "Anniversary",
      business_event: "Business Event",
      customer_reward: "Customer Reward",
      other: "Other",
    };

    return occasions[occasion] || occasion || "-";
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className={styles.page}>

      {/* =================================================
          HEADER
      ================================================= */}




      <div className={styles.header}>

        <div>
          <h1>Gift Management</h1>

          <p>
            Manage customer gifts, rewards and
            target-based incentives.
          </p>
        </div>

        <button
          className={styles.primaryButton}
          onClick={openAddModal}
        >
          + Add Gift
        </button>

      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className={styles.toolbar}>

        <input
          type="text"
          placeholder="Search customer or gift..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.count}>
          {filteredGifts.length} Gifts
        </div>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className={styles.tableContainer}>

        {loading ? (
          <div className={styles.loading}>
            Loading gifts...
          </div>
        ) : filteredGifts.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              🎁
            </div>

            <h3>No gifts found</h3>

            <p>
              Add your first customer gift to
              start tracking rewards.
            </p>

            <button
              className={styles.primaryButton}
              onClick={openAddModal}
            >
              + Add Gift
            </button>
          </div>
        ) : (
          <table className={styles.table}>

            <thead>
              <tr>
                <th>Photo</th>
                <th>Customer</th>
                <th>Gift</th>
                <th>Target</th>
                <th>Quantity</th>
                <th>Value</th>
                <th>Occasion</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredGifts.map((gift) => (

                <tr key={gift._id}>

                  {/* PHOTO */}

                  <td>

                    {gift.receiverPhoto ? (
                      <img
                        src={gift.receiverPhoto}
                        alt={gift.name}
                        className={styles.tablePhoto}
                      />
                    ) : (
                      <div className={styles.noPhoto}>
                        🎁
                      </div>
                    )}

                  </td>

                  {/* CUSTOMER */}

                  <td>

                    <div className={styles.customerCell}>

                      <strong>
                        {getCustomerName(gift)}
                      </strong>

                      {getCustomerPhone(gift) && (
                        <span>
                          {getCustomerPhone(gift)}
                        </span>
                      )}

                    </div>

                  </td>

                  {/* GIFT */}

                  <td>
                    <strong>
                      {gift.name}
                    </strong>
                  </td>

                  {/* TARGET */}

                  <td>
                    {getTargetName(gift)}
                  </td>

                  {/* QUANTITY */}

                  <td>
                    {gift.quantity || 1}
                  </td>

                  {/* VALUE */}

                  <td>
                    ₹
                    {Number(
                      gift.estimatedValue || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  {/* OCCASION */}

                  <td>
                    <span className={styles.badge}>
                      {getOccasionLabel(
                        gift.occasion
                      )}
                    </span>
                  </td>

                  {/* DATE */}

                  <td>
                    {formatDate(gift.givenDate)}
                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className={styles.actions}>

                      <button
                        className={styles.editButton}
                        onClick={() =>
                          openEditModal(gift)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className={styles.deleteButton}
                        onClick={() =>
                          deleteGift(gift._id)
                        }
                      >
                        Delete
                      </button>
                      <button
                        className={styles.visitButton}
                        onClick={() => router.push(`/dashboard/gifts/${gift._id}`)}
                      >
                        Visit
                      </button>

                    </div>

                  </td>

                </tr>


              ))}

            </tbody>

          </table>
        )}

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {showModal && (

        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !submitting
            ) {
              closeModal();
            }
          }}
        >

          <div className={styles.modal}>

            {/* MODAL HEADER */}

            <div className={styles.modalHeader}>

              <div>
                <h2>
                  {editingGift
                    ? "Edit Gift"
                    : "Add Gift"}
                </h2>

                <p>
                  Record a gift given to a customer.
                </p>
              </div>

              <button
                className={styles.closeButton}
                onClick={closeModal}
                disabled={submitting}
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className={styles.form}
            >

              {/* =========================================
                  CUSTOMER
              ========================================= */}

              <div className={styles.formGroup}>

                <label>
                  Customer <span>*</span>
                </label>

                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleCustomerChange}
                  required
                >

                  <option value="">
                    -- Select Customer --
                  </option>

                  {customers.map((customer) => (

                    <option
                      key={customer._id}
                      value={customer._id}
                    >

                      {customer.name}

                      {customer.phone
                        ? ` - ${customer.phone}`
                        : ""}

                      {customer.companyName
                        ? ` - ${customer.companyName}`
                        : ""}

                    </option>

                  ))}

                </select>

                {customers.length === 0 && (
                  <small className={styles.warning}>
                    No customers found. Please add a
                    customer first.
                  </small>
                )}

              </div>

              {/* =========================================
                  TARGET
              ========================================= */}

              <div className={styles.formGroup}>

                <label>
                  Target
                </label>

                <select
                  name="targetId"
                  value={form.targetId}
                  onChange={handleChange}
                  disabled={!form.customerId}
                >

                  <option value="">
                    -- No Target --
                  </option>

                  {targets.map((target) => (

                    <option
                      key={target._id}
                      value={target._id}
                    >

                      {target.name}

                      {target.targetQuantity
                        ? ` — ${target.targetQuantity} ${target.unit || ""}`
                        : ""}

                    </option>

                  ))}

                </select>

                {!form.customerId && (
                  <small>
                    Select a customer first.
                  </small>
                )}

                {form.customerId &&
                  targets.length === 0 && (
                    <small>
                      No targets found for this
                      customer.
                    </small>
                  )}

              </div>

              {/* =========================================
                  GIFT NAME
              ========================================= */}

              <div className={styles.formGroup}>

                <label>
                  Gift Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Smart Watch, Dinner Set, Diwali Gift"
                  required
                />

              </div>

              {/* =========================================
                  QUANTITY + VALUE
              ========================================= */}

              <div className={styles.formRow}>

                <div className={styles.formGroup}>

                  <label>
                    Quantity <span>*</span>
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className={styles.formGroup}>

                  <label>
                    Estimated Value
                  </label>

                  <input
                    type="number"
                    name="estimatedValue"
                    min="0"
                    value={form.estimatedValue}
                    onChange={handleChange}
                    placeholder="₹ 0"
                  />

                </div>

              </div>

              {/* =========================================
                  DATE + OCCASION
              ========================================= */}

              <div className={styles.formRow}>

                <div className={styles.formGroup}>

                  <label>
                    Given Date
                  </label>

                  <input
                    type="date"
                    name="givenDate"
                    value={form.givenDate}
                    onChange={handleChange}
                  />

                </div>

                <div className={styles.formGroup}>

                  <label>
                    Occasion
                  </label>

                  <select
                    name="occasion"
                    value={form.occasion}
                    onChange={handleChange}
                  >

                    <option value="customer_reward">
                      Customer Reward
                    </option>

                    <option value="diwali">
                      Diwali
                    </option>

                    <option value="holi">
                      Holi
                    </option>

                    <option value="new_year">
                      New Year
                    </option>

                    <option value="birthday">
                      Birthday
                    </option>

                    <option value="anniversary">
                      Anniversary
                    </option>

                    <option value="business_event">
                      Business Event
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </div>

              </div>

              {/* =========================================
                  PHOTO
              ========================================= */}

              <div className={styles.formGroup}>

                <label>
                  Receiver Photo
                </label>

                <div className={styles.photoActions}>

                  {/* CAMERA */}

                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={openCamera}
                  >
                    📷 Open Camera
                  </button>

                  {/* GALLERY */}

                  <label
                    className={styles.uploadButton}
                  >

                    🖼️ Choose Photo

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      hidden
                    />

                  </label>

                </div>

                {/* PHOTO PREVIEW */}

                {photoPreview && (

                  <div
                    className={styles.previewContainer}
                  >

                    <img
                      src={photoPreview}
                      alt="Receiver preview"
                      className={styles.photoPreview}
                    />

                    <button
                      type="button"
                      className={styles.removePhoto}
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview("");
                        setForm((prev) => ({
                          ...prev,
                          receiverPhoto: "",
                        }));
                      }}
                    >
                      Remove Photo
                    </button>

                  </div>

                )}

              </div>

              {/* =========================================
                  NOTES
              ========================================= */}

              <div className={styles.formGroup}>

                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Add any additional information..."
                  rows={4}
                />

              </div>

              {/* =========================================
                  BUTTONS
              ========================================= */}

              <div className={styles.formActions}>

                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={submitting}
                >

                  {submitting
                    ? "Saving..."
                    : editingGift
                      ? "Update Gift"
                      : "Save Gift"}

                </button>

              </div>

              {showCamera && (
                <div className={styles.cameraOverlay}>

                  <div className={styles.cameraModal}>

                    <div className={styles.cameraHeader}>
                      <h2>Take Photo</h2>

                      <button
                        type="button"
                        onClick={closeCamera}
                        className={styles.closeButton}
                      >
                        ×
                      </button>
                    </div>

                    <div className={styles.videoContainer}>

                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={styles.cameraVideo}
                      />

                    </div>

                    <div className={styles.cameraActions}>

                      <button
                        type="button"
                        onClick={closeCamera}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={capturePhoto}
                        className={styles.captureButton}
                      >
                        📸 Take Photo
                      </button>

                    </div>

                  </div>

                </div>
              )}

            </form>

          </div>

        </div>

      )}

    </div>
  );
}