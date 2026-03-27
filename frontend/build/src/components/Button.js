import React from "react"

const VARIANT_TO_CLASS = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    danger: "btn btn-danger",
}

const SIZE_TO_CLASS = {
    sm: "text-sm py-2 px-3",
    md: "text-base py-2.5 px-4",
    lg: "text-base py-3 px-5",
}

const Button = ({ children, variant = "primary", size = "md", className, ...props }) => {
    const classes = [VARIANT_TO_CLASS[variant] || VARIANT_TO_CLASS.primary, SIZE_TO_CLASS[size], className]
        .filter(Boolean)
        .join(" ")
    return (
        <button className={classes} {...props}>
            {children}
        </button>
    )
}

export default Button