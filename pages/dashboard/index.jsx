import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { useRouter } from "next/router";
import styles from "@/styles/dashboard.module.css";

import axios from "axios";

export const dashboard = () => {

    const { data: session } = useSession();

    const router = useRouter();

    const [customers, setCustomers] = useState([]);

    // Search
    const [search, setSearch] = useState("");

    // Filter
    const [sortBy, setSortBy] = useState("latest");


    /* =========================
       FETCH CUSTOMERS
    ========================= */

    useEffect(() => {

        const fetchCustomerData = async () => {

            try {

                const response = await axios.get(
                    "/api/customers"
                );

                console.log(response.data);

                setCustomers(
                    response.data.customers || []
                );

            } catch (e) {

                console.error(
                    "Failed to fetch customers:",
                    e
                );

            }

        };

        fetchCustomerData();

    }, []);


    /* =========================
       GO TO CUSTOMER
    ========================= */

    const goToCustomer = (cid) => {

        router.push(`/customer/${cid}`);

    };


    /* =========================
       FILTER + SORT
    ========================= */

    const filteredCustomers = useMemo(() => {

        let result = [...customers];


        /* =========================
           SEARCH
        ========================= */

        if (search.trim()) {

            const query =
                search.trim().toLowerCase();

            result = result.filter((customer) => {

                const name =
                    customer.name
                        ?.toLowerCase() || "";

                const phone =
                    customer.phone
                        ?.toString()
                        .toLowerCase() || "";

                const city =
                    customer.addresses?.[0]?.city
                        ?.toLowerCase() || "";

                const state =
                    customer.addresses?.[0]?.state
                        ?.toLowerCase() || "";


                return (
                    name.includes(query) ||
                    phone.includes(query) ||
                    city.includes(query) ||
                    state.includes(query)
                );

            });

        }


        /* =========================
           SORT
        ========================= */

        result.sort((a, b) => {

            switch (sortBy) {

                case "latest": {

                    const dateA =
                        new Date(
                            a.createdAt ||
                            a.doc ||
                            0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.createdAt ||
                            b.doc ||
                            0
                        ).getTime();

                    return dateB - dateA;
                }


                case "oldest": {

                    const dateA =
                        new Date(
                            a.createdAt ||
                            a.doc ||
                            0
                        ).getTime();

                    const dateB =
                        new Date(
                            b.createdAt ||
                            b.doc ||
                            0
                        ).getTime();

                    return dateA - dateB;
                }


                case "mostPerforming": {

                    const purchasesA =
                        a.purchases?.reduce(
                            (total, item) =>
                                total +
                                Number(
                                    item.quantity || 0
                                ),
                            0
                        ) || 0;

                    const purchasesB =
                        b.purchases?.reduce(
                            (total, item) =>
                                total +
                                Number(
                                    item.quantity || 0
                                ),
                            0
                        ) || 0;

                    return purchasesB - purchasesA;
                }


                case "leastPerforming": {

                    const purchasesA =
                        a.purchases?.reduce(
                            (total, item) =>
                                total +
                                Number(
                                    item.quantity || 0
                                ),
                            0
                        ) || 0;

                    const purchasesB =
                        b.purchases?.reduce(
                            (total, item) =>
                                total +
                                Number(
                                    item.quantity || 0
                                ),
                            0
                        ) || 0;

                    return purchasesA - purchasesB;
                }


                case "nameAZ": {

                    return (
                        a.name || ""
                    ).localeCompare(
                        b.name || ""
                    );

                }


                case "nameZA": {

                    return (
                        b.name || ""
                    ).localeCompare(
                        a.name || ""
                    );

                }


                default:
                    return 0;

            }

        });


        return result;

    }, [customers, search, sortBy]);


    return (

        <>

            <div className={styles.customerList}>

                {/* =========================
                    FILTER BOX
                ========================= */}

                <div className={styles.filterBox}>

                    <input
                        type="text"
                        placeholder="Search customer, phone or location..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />


                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value)
                        }
                    >

                        <option value="latest">
                            Newest
                        </option>

                        <option value="oldest">
                            Oldest
                        </option>

                        <option value="mostPerforming">
                            Most Performing
                        </option>

                        <option value="leastPerforming">
                            Least Performing
                        </option>

                        <option value="nameAZ">
                            Name A-Z
                        </option>

                        <option value="nameZA">
                            Name Z-A
                        </option>

                    </select>

                </div>


                {/* =========================
                    RESULT COUNT
                ========================= */}

                <div className={styles.resultCount}>

                    Showing{" "}

                    <strong>
                        {filteredCustomers.length}
                    </strong>

                    {" "}of{" "}

                    <strong>
                        {customers.length}
                    </strong>

                    {" "}customers

                </div>


                {/* =========================
                    HEADER
                ========================= */}

                <div
                    className={
                        styles.customerListHeader
                    }
                >

                    <span>Customer</span>

                    <span>Phone</span>

                    <span>Location</span>

                    <span>Purchases</span>

                    <span>Joined</span>

                </div>


                {/* =========================
                    CUSTOMERS
                ========================= */}

                {filteredCustomers.map(
                    (customer) => (

                        <div
                            className={
                                styles.customerCard
                            }
                            key={customer._id}
                        >

                            {/* Customer */}

                            <div
                                className={
                                    styles.customerIdentity
                                }

                                onClick={() =>
                                    goToCustomer(
                                        customer._id
                                    )
                                }
                            >

                                <div
                                    className={
                                        styles.customerImage
                                    }
                                >

                                    <img
                                        src={
                                            customer.image ||
                                            "/images/default-user.png"
                                        }
                                        alt={
                                            customer.name
                                        }
                                    />

                                </div>


                                <div
                                    className={
                                        styles.customerName
                                    }
                                >

                                    <h3>
                                        {customer.name}
                                    </h3>

                                    <span>
                                        Customer
                                    </span>

                                </div>

                            </div>


                            {/* Phone */}

                            <div
                                className={
                                    styles.customerDetail
                                }
                            >

                                <label>
                                    Phone
                                </label>

                                <p>
                                    <a
                                        href={`tel:+${customer.phone}`}
                                    >
                                        {customer.phone}
                                    </a>
                                </p>

                            </div>


                            {/* Location */}

                            <div
                                className={
                                    styles.customerDetail
                                }
                            >

                                <label>
                                    Location
                                </label>

                                <p>

                                    {
                                        customer
                                            .addresses
                                            ?.[
                                            0
                                        ]
                                            ?.city
                                    }

                                    {customer
                                        .addresses
                                        ?.[
                                        0
                                    ]
                                        ?.city &&
                                        customer
                                            .addresses
                                            ?.[
                                            0
                                        ]
                                            ?.state
                                        ? ", "
                                        : ""}

                                    {
                                        customer
                                            .addresses
                                            ?.[
                                            0
                                        ]
                                            ?.state
                                    }

                                </p>

                            </div>


                            {/* Purchases */}

                            <div
                                className={
                                    styles.customerDetail
                                }
                            >

                                <label>
                                    Purchases
                                </label>


                                <span
                                    className={
                                        styles.purchaseBadge
                                    }
                                >

                                    {
                                        customer
                                            .purchases
                                            ?.length || 0
                                    }

                                    {" "}Products

                                </span>

                            </div>


                            {/* Date */}

                            <div
                                className={
                                    styles.customerDate
                                }
                            >

                                {customer.createdAt ||
                                    customer.doc

                                    ? new Date(
                                        customer.createdAt ||
                                        customer.doc
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )

                                    : "—"}

                            </div>

                        </div>

                    )
                )}


                {/* =========================
                    NO RESULTS
                ========================= */}

                {filteredCustomers.length === 0 && (

                    <div
                        className={
                            styles.noCustomers
                        }
                    >

                        <div>
                            🔍
                        </div>

                        <h3>
                            No customers found
                        </h3>

                        <p>
                            Try changing your search
                            or filter.
                        </p>

                        <Link href={"/newCustomer"}>+Add Customers</Link>

                    </div>

                )}

            </div>

        </>

    );
};

export default dashboard;