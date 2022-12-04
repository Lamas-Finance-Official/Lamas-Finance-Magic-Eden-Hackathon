use anchor_lang::prelude::*;

#[repr(C)]
#[derive(Default, AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct Decimal {
    pub value: i128,
    pub decimals: u32,
}

impl Decimal {
    pub const SIZE: usize = 16 + 4;

    pub fn new(value: i128, decimals: u32) -> Self {
        Decimal { value, decimals }
    }

    fn to_decimal(&self, decimals: u32) -> Option<i128> {
        assert!(self.decimals <= decimals, "lost precision");

        let value = self
            .value
            .checked_mul(10i128.checked_pow((decimals - self.decimals) as _)?)?;

        Some(value)
    }
}

impl PartialEq for Decimal {
    fn eq(&self, other: &Self) -> bool {
        if self.decimals == other.decimals {
            self.value == other.value
        } else {
            let big_decimals = u32::max(self.decimals, other.decimals);

            let lhs = self.to_decimal(big_decimals);
            let rhs = other.to_decimal(big_decimals);
            match (lhs, rhs) {
                (Some(lhs), Some(rhs)) => lhs == rhs,
                _ => false,
            }
        }
    }
}

impl Eq for Decimal {}

impl PartialOrd for Decimal {
    #[inline]
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Decimal {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        let big_decimals = u32::max(self.decimals, other.decimals);

        let lhs = self.to_decimal(big_decimals);
        let rhs = other.to_decimal(big_decimals);
        match (lhs, rhs) {
            (Some(lhs), Some(rhs)) => lhs.cmp(&rhs),
            (None, Some(_)) => std::cmp::Ordering::Greater,
            (Some(_), None) => std::cmp::Ordering::Less,
            (None, None) => unreachable!(),
        }
    }
}

impl std::fmt::Debug for Decimal {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(self, f)
    }
}

impl std::fmt::Display for Decimal {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut scaled_val = self.value.to_string();
        if scaled_val.len() <= self.decimals as usize {
            scaled_val.insert_str(
                0,
                &vec!["0"; self.decimals as usize - scaled_val.len()].join(""),
            );
            scaled_val.insert_str(0, "0.");
        } else {
            scaled_val.insert(scaled_val.len() - self.decimals as usize, '.');
        }
        f.write_str(&scaled_val)
    }
}

#[cfg(test)]
mod test {
    use super::Decimal;

    #[test]
    fn equal_test() {
        assert_eq!(Decimal::new(12345678900, 2), Decimal::new(1234567890, 1));
        assert_eq!(Decimal::new(1234567890000, 4), Decimal::new(1234567890, 1));
        assert_eq!(Decimal::new(1234567890000, 4), Decimal::new(12345678900, 2));
        assert_eq!(Decimal::new(123456789, 4), Decimal::new(12345678900, 6));

        assert_ne!(Decimal::new(1234567890, 4), Decimal::new(12345678900, 6));
        assert_ne!(Decimal::new(123456789, 3), Decimal::new(12345678900, 6));
        assert_ne!(Decimal::new(123456789, 2), Decimal::new(123456788, 2));
    }

    #[test]
    fn cmp_test() {
        assert!(Decimal::new(123456789, 2) > Decimal::new(123456788, 2));
        assert!(Decimal::new(123456789, 3) < Decimal::new(123456788, 2));
        assert!(Decimal::new(123456789, 4) < Decimal::new(123456788, 2));
        assert!(Decimal::new(123456789, 2) >= Decimal::new(123456789, 2));
        assert!(Decimal::new(123456789, 2) <= Decimal::new(123456789, 2));

        assert!(Decimal::new(123456789, 40) < Decimal::new(123456789, 2));
    }
}
