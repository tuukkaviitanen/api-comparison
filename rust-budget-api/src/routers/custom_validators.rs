use std::collections::HashSet;
use validator::ValidationError;

pub fn validate_category(category: &str) -> Result<(), ValidationError> {
    // Define a set of valid categories
    let valid_categories: HashSet<&str> = [
        "health",
        "recreation",
        "food & drinks",
        "household & services",
        "other",
        "transport",
    ]
    .iter()
    .cloned()
    .collect();

    // Check if the provided category is in the set of valid categories
    if valid_categories.contains(category.to_lowercase().as_str()) {
        Ok(())
    } else {
        Err(ValidationError::new("invalid category"))
    }
}

pub fn validate_sort(sort: &str) -> Result<(), ValidationError> {
    // Define a set of valid sort options
    let valid_sorts: HashSet<&str> = ["timestamp", "category"].iter().cloned().collect();

    // Check if the provided sort option is in the set of valid sort options
    if valid_sorts.contains(sort) {
        Ok(())
    } else {
        Err(ValidationError::new("invalid sort"))
    }
}

pub fn validate_order(sort: &str) -> Result<(), ValidationError> {
    // Define a set of valid sort options
    let valid_sorts: HashSet<&str> = ["asc", "desc"].iter().cloned().collect();

    // Check if the provided sort option is in the set of valid sort options
    if valid_sorts.contains(sort) {
        Ok(())
    } else {
        Err(ValidationError::new("invalid order"))
    }
}

pub fn validate_value_precision(value: f64) -> Result<(), ValidationError> {
    // Define a set of valid sort options
    let value_rounded_to_2_decimals = (value * 100.0).round() / 100.0;

    // Check if the provided sort option is in the set of valid sort options
    if value_rounded_to_2_decimals == value {
        Ok(())
    } else {
        Err(ValidationError::new("invalid value precision"))
    }
}
