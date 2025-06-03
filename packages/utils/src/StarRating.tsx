import styles from "./StarRating.module.css";

type StarRatingProps = {
  rating: number;
  size?: "small" | "medium" | "large";
};

/**
 * StarRating component displays a star rating based on the provided rating value.
 * It supports full stars, half stars, and empty stars, and can be styled based on size.
 *
 * @param {StarRatingProps} props - The properties for the StarRating component.
 * @returns {JSX.Element} The rendered star rating component.
 */
export function StarRating({ rating, size = "medium" }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`${styles.starRating} ${styles[size]}`}>
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className={styles.fullStar}>
          ★
        </span>
      ))}
      {hasHalfStar && <span className={styles.halfStar}>★</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className={styles.emptyStar}>
          ★
        </span>
      ))}
    </div>
  );
}
