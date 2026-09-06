import { useEffect, useRef, useState } from "react";
import styles from "@/styles/newCustomer.module.css";
import axios from "axios";
import { useRouter } from "next/router";

export default function CustomerDashboard() {
    const router = useRouter();

    const customerId = router.query.customerId;
    const isEditMode = Boolean(customerId);

    const [loading, setLoading] = useState(false);
    const [fetchingCustomer, setFetchingCustomer] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        image: "",

        address: "",
        city: "",
        state: "",
        country: "INDIA",
        pincode: "",

        notes: "",

        purchases: [],
    });

    /* =========================
       CAMERA
    ========================= */

    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraLoading, setCameraLoading] = useState(false);

    /* =========================
       IMAGE
    ========================= */

    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    const videoRef = useRef(null);

    /* =========================
       FETCH CUSTOMER FOR EDIT
    ========================= */

    useEffect(() => {
        if (!router.isReady) return;
        if (!customerId) return;

        const fetchCustomer = async () => {
            try {
                setFetchingCustomer(true);

                const response = await axios.get(
                    `/api/customers/${customerId}`
                );

                const data = response.data?.data;

                if (!data?.customer) {
                    throw new Error("Customer not found");
                }

                const customer = data.customer;

                const defaultAddress =
                    customer.addresses?.find(
                        (address) => address.isDefault
                    ) ||
                    customer.addresses?.[0] ||
                    {};

                setForm({
                    name: customer.name || "",
                    phone: customer.phone || "",
                    email: customer.email || "",
                    image: customer.image || "",

                    address: defaultAddress.address || "",
                    city: defaultAddress.city || "",
                    state: defaultAddress.state || "",
                    country:
                        defaultAddress.country || "INDIA",
                    pincode: defaultAddress.pincode || "",

                    notes: customer.notes || "",

                    purchases: [],
                });

                /*
                 * Show existing image
                 */
                if (customer.image) {
                    setPhotoPreview(customer.image);
                }
            } catch (error) {
                console.error(
                    "Failed to fetch customer:",
                    error
                );

                alert(
                    error.response?.data?.error ||
                    error.message ||
                    "Failed to load customer"
                );
            } finally {
                setFetchingCustomer(false);
            }
        };

        fetchCustomer();
    }, [router.isReady, customerId]);

    /* =========================
       BASIC INPUT
    ========================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* =========================
       PRODUCTS
    ========================= */

    const addProduct = () => {
        setForm((prev) => ({
            ...prev,

            purchases: [
                ...prev.purchases,

                {
                    productName: "",
                    category: "cement",
                    quantity: "",
                    unit: "bag",
                    notes: "",
                },
            ],
        }));
    };

    const updateProduct = (index, field, value) => {
        setForm((prev) => {
            const purchases = [...prev.purchases];

            purchases[index] = {
                ...purchases[index],
                [field]: value,
            };

            return {
                ...prev,
                purchases,
            };
        });
    };

    const removeProduct = (index) => {
        setForm((prev) => ({
            ...prev,

            purchases: prev.purchases.filter(
                (_, i) => i !== index
            ),
        }));
    };

    /* =========================
       UPLOAD PHOTO
    ========================= */

    const uploadPhoto = async () => {
        /*
         * No new image selected.
         *
         * If editing, return the existing image.
         */
        if (!photoFile) {
            return form.image || "";
        }

        const formData = new FormData();

        formData.append("file", photoFile);

        formData.append(
            "folder",
            "tradeintel/customers"
        );

        try {
            const response = await axios.post(
                "/api/files/upload",
                formData
            );

            const uploadedUrl =
                response.data?.data?.url ||
                response.data?.url ||
                "";

            if (!uploadedUrl) {
                throw new Error(
                    "Upload URL was not returned."
                );
            }

            return uploadedUrl;
        } catch (error) {
            console.error(
                "Photo upload failed:",
                error
            );

            throw new Error(
                error.response?.data?.error ||
                "Failed to upload photo"
            );
        }
    };

    /* =========================
       SUBMIT
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.name.trim() ||
            !form.phone.trim()
        ) {
            alert("Name and phone are required");
            return;
        }

        setLoading(true);

        try {
            /*
             * Upload image first.
             *
             * If no new image was selected,
             * uploadPhoto() returns existing image.
             */
            const imageUrl = await uploadPhoto();

            const payload = {
                name: form.name.trim(),

                phone: form.phone.trim(),

                email: form.email.trim(),

                image: imageUrl,

                addresses: [
                    {
                        address: form.address.trim(),
                        city: form.city.trim(),
                        state: form.state.trim(),
                        country:
                            form.country.trim(),
                        pincode:
                            form.pincode.trim(),
                        isDefault: true,
                    },
                ],

                notes: form.notes.trim(),
            };

            let response;

            /* =========================
               EDIT
            ========================= */

            if (isEditMode) {
                response = await axios.put(
                    `/api/customers/${customerId}`,
                    payload
                );
            }

            /* =========================
               CREATE
            ========================= */

            else {
                response = await axios.post(
                    "/api/customers",
                    payload
                );
            }

            /*
             * Axios throws automatically
             * for non-2xx responses.
             */

            const responseCustomer =
                response.data?.customer ||
                response.data?.data?.customer;

            /* =========================
               SUCCESS
            ========================= */

            alert(
                isEditMode
                    ? "Customer updated successfully"
                    : "Customer created successfully"
            );

            /* =========================
               EDIT MODE
            ========================= */

            if (isEditMode) {
                if (responseCustomer) {
                    const defaultAddress =
                        responseCustomer.addresses?.find(
                            (address) =>
                                address.isDefault
                        ) ||
                        responseCustomer
                            .addresses?.[0] ||
                        {};

                    setForm({
                        name:
                            responseCustomer.name ||
                            "",

                        phone:
                            responseCustomer.phone ||
                            "",

                        email:
                            responseCustomer.email ||
                            "",

                        image:
                            responseCustomer.image ||
                            "",

                        address:
                            defaultAddress.address ||
                            "",

                        city:
                            defaultAddress.city ||
                            "",

                        state:
                            defaultAddress.state ||
                            "",

                        country:
                            defaultAddress.country ||
                            "INDIA",

                        pincode:
                            defaultAddress.pincode ||
                            "",

                        notes:
                            responseCustomer.notes ||
                            "",

                        purchases: [],
                    });

                    setPhotoFile(null);

                    if (
                        responseCustomer.image
                    ) {
                        setPhotoPreview(
                            responseCustomer.image
                        );
                    }
                }

                return;
            }

            /* =========================
               CREATE MODE RESET
            ========================= */

            setForm({
                name: "",
                phone: "",
                email: "",
                image: "",

                address: "",
                city: "",
                state: "",
                country: "INDIA",
                pincode: "",

                notes: "",

                purchases: [],
            });

            setPhotoFile(null);
            setPhotoPreview("");
        } catch (error) {
            console.error(
                "Customer save failed:",
                error
            );

            alert(
                error.response?.data?.error ||
                error.message ||
                "Failed to save customer"
            );
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       SELECT IMAGE
    ========================= */

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert(
                "Image must be less than 10MB."
            );
            return;
        }

        /*
         * Store actual File
         */
        setPhotoFile(file);

        /*
         * Create preview
         */
        const previewUrl =
            URL.createObjectURL(file);

        setPhotoPreview(previewUrl);
    };

    /* =========================
       OPEN CAMERA
    ========================= */

    const openCamera = async () => {
        try {
            setCameraLoading(true);

            if (
                !navigator.mediaDevices?.getUserMedia
            ) {
                alert(
                    "Your browser does not support camera access."
                );

                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        video: {
                            facingMode:
                                "environment",
                        },

                        audio: false,
                    }
                );

            setCameraStream(stream);
            setShowCamera(true);

            /*
             * Wait for video element
             */
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject =
                        stream;

                    videoRef.current.play();
                }
            }, 100);
        } catch (error) {
            console.error(
                "Camera error:",
                error
            );

            if (
                error.name ===
                "NotAllowedError"
            ) {
                alert(
                    "Camera permission was denied. Please allow camera access in your browser."
                );
            } else if (
                error.name ===
                "NotFoundError"
            ) {
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

    /* =========================
       CAPTURE PHOTO
    ========================= */

    const capturePhoto = () => {
        const video = videoRef.current;

        if (
            !video ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            alert(
                "Camera is not ready yet."
            );

            return;
        }

        const canvas =
            document.createElement("canvas");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context =
            canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    alert(
                        "Failed to capture photo."
                    );

                    return;
                }

                const file = new File(
                    [blob],
                    `customer-${Date.now()}.jpg`,
                    {
                        type: "image/jpeg",
                    }
                );

                /*
                 * Store actual file
                 */
                setPhotoFile(file);

                /*
                 * Preview
                 */
                const previewUrl =
                    URL.createObjectURL(file);

                setPhotoPreview(previewUrl);

                /*
                 * Close camera
                 */
                closeCamera();
            },
            "image/jpeg",
            0.9
        );
    };

    /* =========================
       CLOSE CAMERA
    ========================= */

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream
                .getTracks()
                .forEach((track) =>
                    track.stop()
                );
        }

        setCameraStream(null);
        setShowCamera(false);
    };

    /* =========================
       RENDER
    ========================= */

    return (
        <main className={styles.page}>
            {/* =========================
                HEADER
            ========================= */}

            <header className={styles.header}>
                <div>
                    <span
                        className={
                            styles.eyebrow
                        }
                    >
                        CUSTOMER MANAGEMENT
                    </span>

                    <h1>
                        {isEditMode
                            ? "Edit Customer"
                            : "Add New Customer"}
                    </h1>

                    <p>
                        {isEditMode
                            ? "Update customer information and details."
                            : "Record customer information, purchases and gifts."}
                    </p>
                </div>

                <div
                    className={
                        styles.headerIcon
                    }
                >
                    {isEditMode ? "✎" : "+"}
                </div>
            </header>

            {/* =========================
                LOADING
            ========================= */}

            {fetchingCustomer && (
                <div
                    className={
                        styles.loadingBanner
                    }
                >
                    Loading customer information...
                </div>
            )}

            {/* =========================
                FORM
            ========================= */}

            <form
                className={styles.form}
                onSubmit={handleSubmit}
                style={{
                    opacity:
                        fetchingCustomer
                            ? 0.6
                            : 1,

                    pointerEvents:
                        fetchingCustomer
                            ? "none"
                            : "auto",
                }}
            >
                {/* =========================
                    LEFT COLUMN
                ========================= */}

                <div
                    className={
                        styles.leftColumn
                    }
                >
                    {/* =========================
                        CUSTOMER INFORMATION
                    ========================= */}

                    <section
                        className={
                            styles.card
                        }
                    >
                        <div
                            className={
                                styles.cardHeader
                            }
                        >
                            <div
                                className={
                                    styles.icon
                                }
                            >
                                👤
                            </div>

                            <div>
                                <h2>
                                    Customer
                                    Information
                                </h2>

                                <p>
                                    Basic details
                                    of the
                                    customer
                                </p>
                            </div>
                        </div>

                        {/* =========================
                            AVATAR
                        ========================= */}

                        <div
                            className={
                                styles.avatarSection
                            }
                        >
                            <div
                                className={
                                    styles.avatar
                                }
                            >
                                {photoPreview ? (
                                    <img
                                        src={
                                            photoPreview
                                        }
                                        alt="Customer Avatar"
                                    />
                                ) : (
                                    <span>
                                        {form.name
                                            ? form.name
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()
                                            : "?"}
                                    </span>
                                )}
                            </div>

                            <div
                                className={
                                    styles.imageActions
                                }
                            >
                                <button
                                    type="button"
                                    className={
                                        styles.imageButton
                                    }
                                    onClick={
                                        openCamera
                                    }
                                    disabled={
                                        cameraLoading
                                    }
                                >
                                    {cameraLoading
                                        ? "Opening Camera..."
                                        : "📷 Open Camera"}
                                </button>

                                <label
                                    className={
                                        styles.imageButton
                                    }
                                >
                                    🖼️ Select
                                    Image

                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={
                                            handleImageChange
                                        }
                                    />
                                </label>
                            </div>
                        </div>

                        {/* =========================
                            BASIC FIELDS
                        ========================= */}

                        <div
                            className={
                                styles.grid2
                            }
                        >
                            <Input
                                label="Full Name"
                                name="name"
                                placeholder="Rajesh Kumar"
                                value={
                                    form.name
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <Input
                                label="Phone Number"
                                name="phone"
                                placeholder="9876543210"
                                value={
                                    form.phone
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="customer@email.com"
                                value={
                                    form.email
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>
                    </section>

                    {/* =========================
                        ADDRESS
                    ========================= */}

                    <section
                        className={
                            styles.card
                        }
                    >
                        <div
                            className={
                                styles.cardHeader
                            }
                        >
                            <div
                                className={
                                    styles.icon
                                }
                            >
                                📍
                            </div>

                            <div>
                                <h2>
                                    Address
                                </h2>

                                <p>
                                    Customer's
                                    primary
                                    location
                                </p>
                            </div>
                        </div>

                        <Input
                            label="Address"
                            name="address"
                            placeholder="12 Shastri Nagar"
                            value={
                                form.address
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                        <div
                            className={
                                styles.grid3
                            }
                        >
                            <Input
                                label="City"
                                name="city"
                                placeholder="Udaipur"
                                value={
                                    form.city
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <Input
                                label="State"
                                name="state"
                                placeholder="Rajasthan"
                                value={
                                    form.state
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <Input
                                label="Pincode"
                                name="pincode"
                                placeholder="313001"
                                value={
                                    form.pincode
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>
                    </section>

                    {/* =========================
                        NOTES
                    ========================= */}

                    <section
                        className={
                            styles.card
                        }
                    >
                        <div
                            className={
                                styles.cardHeader
                            }
                        >
                            <div
                                className={
                                    styles.icon
                                }
                            >
                                📝
                            </div>

                            <div>
                                <h2>
                                    Customer
                                    Notes
                                </h2>

                                <p>
                                    Additional
                                    information
                                </p>
                            </div>
                        </div>

                        <textarea
                            className={
                                styles.textarea
                            }
                            name="notes"
                            value={
                                form.notes
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Add any useful information about this customer..."
                        />
                    </section>

                    {/* =========================
                        SAVE
                    ========================= */}

                    <div
                        className={
                            styles.saveArea
                        }
                    >
                        <button
                            type="submit"
                            disabled={
                                loading ||
                                fetchingCustomer
                            }
                            className={
                                styles.saveButton
                            }
                        >
                            {loading
                                ? isEditMode
                                    ? "Updating Customer..."
                                    : "Saving Customer..."
                                : isEditMode
                                    ? "Update Customer →"
                                    : "Save Customer →"}
                        </button>

                        <span>
                            Customer information
                            will be securely
                            stored.
                        </span>
                    </div>

                    {/* =========================
                        CAMERA MODAL
                    ========================= */}

                    {showCamera && (
                        <div
                            className={
                                styles.cameraOverlay
                            }
                        >
                            <div
                                className={
                                    styles.cameraModal
                                }
                            >
                                <div
                                    className={
                                        styles.cameraHeader
                                    }
                                >
                                    <h2>
                                        Take Photo
                                    </h2>

                                    <button
                                        type="button"
                                        onClick={
                                            closeCamera
                                        }
                                        className={
                                            styles.closeButton
                                        }
                                    >
                                        ×
                                    </button>
                                </div>

                                <div
                                    className={
                                        styles.videoContainer
                                    }
                                >
                                    <video
                                        ref={
                                            videoRef
                                        }
                                        autoPlay
                                        playsInline
                                        muted
                                        className={
                                            styles.cameraVideo
                                        }
                                    />
                                </div>

                                <div
                                    className={
                                        styles.cameraActions
                                    }
                                >
                                    <button
                                        type="button"
                                        onClick={
                                            closeCamera
                                        }
                                        className={
                                            styles.cancelButton
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            capturePhoto
                                        }
                                        className={
                                            styles.captureButton
                                        }
                                    >
                                        📸 Take Photo
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </main>
    );
}

/* =========================
   REUSABLE INPUT
========================= */

function Input({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    required = false,
}) {
    return (
        <label
            className={
                styles.inputGroup
            }
        >
            <span>
                {label}

                {required && (
                    <b>*</b>
                )}
            </span>

            <input
                className={
                    styles.input
                }
                type={type}
                name={name}
                placeholder={
                    placeholder
                }
                value={value}
                onChange={
                    onChange
                }
                required={
                    required
                }
            />
        </label>
    );
}