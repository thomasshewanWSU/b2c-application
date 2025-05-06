import Link from "next/link";
import Image from "next/image";
import styles from "./orderList.module.css";
import { formatPrice } from "../../utils/productUtils"; // Adjust the import path as necessary
type OrderTableProps = {
  orders: any[];
  formatDate: (date: string) => string;
  getStatusClass: (status: string) => string; // Updated to never return undefined
};

export function OrderTable({
  orders,
  formatDate,
  getStatusClass,
}: OrderTableProps) {
  return (
    <div className={styles.orderTable}>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>
                <div className={styles.customerInfo}>
                  <span className={styles.customerName}>{order.user.name}</span>
                  <span className={styles.customerEmail}>
                    {order.user.email}
                  </span>
                </div>
              </td>
              <td>{formatDate(order.createdAt)}</td>
              <td>
                <span
                  className={`${styles.statusBadge} ${getStatusClass(order.status)}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td>
                <div className={styles.orderItems}>
                  {order.items.slice(0, 3).map((item: any) => (
                    <div key={item.id} className={styles.orderItemPreview}>
                      {item.product.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={24}
                          height={24}
                          className={styles.orderItemImage}
                        />
                      )}
                      <span>{item.quantity}x</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className={styles.moreItems}>
                      +{order.items.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className={styles.orderTotal}>{formatPrice(order.total)}</td>
              <td>
                <div className={styles.orderActions}>
                  <Link
                    href={`/orders/${order.id}`}
                    className={styles.viewButton}
                  >
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
