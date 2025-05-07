"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./userDetail.module.css";
import {
  AlertMessage,
  formatDate,
  formatPrice,
  getOrderStatusClass,
} from "@repo/utils/";

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string | Date;
};

type UserDetailProps = {
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    orderCount: number;
  };
  recentOrders: Order[];
};

export function UserDetail({ user, recentOrders }: UserDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentRole, setCurrentRole] = useState(user.role);

  // Function to handle role change
  const updateUserRole = async (newRole: string) => {
    if (newRole === currentRole) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentRole(newRole);
        setSuccess(`User role updated to ${newRole}`);
      } else {
        setError(data.message || "Failed to update user role");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get role badge class
  const getRoleBadgeClass = (role: string) => {
    return role === "admin" ? styles.adminBadge : styles.customerBadge;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Link href="/users" className={styles.breadcrumbLink}>
            Users
          </Link>{" "}
          / {user.name || user.email}
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

      <div className={styles.layout}>
        <div className={styles.mainContent}>
          <div className={styles.userProfileCard}>
            <div className={styles.userHeader}>
              <div className={styles.userAvatarLarge}>
                {(user.name?.charAt(0) || user.email.charAt(0)).toUpperCase()}
              </div>
              <div className={styles.userDetails}>
                <h1 className={styles.userName}>{user.name || "No Name"}</h1>
                <div className={styles.userEmail}>{user.email}</div>
                <div className={styles.userMeta}>
                  <span
                    className={`${styles.roleBadge} ${getRoleBadgeClass(currentRole)}`}
                  >
                    {currentRole}
                  </span>
                  <span className={styles.userSince}>
                    User since {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.userInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>User ID</span>
                <span className={styles.infoValue}>#{user.id}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Orders</span>
                <span className={styles.infoValue}>{user.orderCount}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Last Updated</span>
                <span className={styles.infoValue}>
                  {formatDate(user.updatedAt)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Role</span>
                <div>{user.role}</div>
              </div>
            </div>
          </div>

          {recentOrders.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Recent Orders</h2>
                <Link
                  href={`/orders?userId=${user.id}`}
                  className={styles.viewAllLink}
                >
                  View All Orders
                </Link>
              </div>
              <div className={styles.recentOrdersList}>
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className={styles.orderItem}
                  >
                    <div className={styles.orderInfo}>
                      <span className={styles.orderNumber}>
                        Order #{order.id}
                      </span>
                      <span className={styles.orderDate}>
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className={styles.orderMeta}>
                      <span
                        className={`${styles.statusBadge} ${getOrderStatusClass(order.status)}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                      <span className={styles.orderTotal}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Contact Information</h2>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <div className={styles.contactLabel}>Email Address</div>
                <a
                  href={`mailto:${user.email}`}
                  className={styles.contactValue}
                >
                  {user.email}
                </a>
              </div>
              {/* Add more contact fields here as needed */}
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Actions</h2>
            <div className={styles.actionButtons}>
              <Link
                href={`/orders?userId=${user.id}`}
                className={styles.actionLink}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.actionIcon}
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                View Order History
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Account Statistics</h2>
            <div className={styles.statsList}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{user.orderCount}</div>
                <div className={styles.statLabel}>Total Orders</div>
              </div>
              {/* Add more statistics here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
