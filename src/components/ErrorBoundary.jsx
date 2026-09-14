import React from "react";
import { withTranslation } from "react-i18next";

/**
 * Top-level React Error Boundary — SAFETY NET ONLY.
 *
 * This is NOT the fix for the Chrome Translate reconciliation issue.
 * It only guarantees that if an unexpected render/unmount error slips
 * through, the user sees a recoverable screen instead of a blank white page.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Keep the console visible for diagnostics without unmounting the app.
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    render() {
        const { t } = this.props;
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f8fafc",
                        padding: "1.5rem",
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    }}
                >
                    <div
                        style={{
                            maxWidth: 420,
                            width: "100%",
                            background: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 16,
                            padding: "2rem",
                            textAlign: "center",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
                        <h1
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#0f172a",
                                margin: "0 0 8px",
                            }}
                        >
                            {t("demo.errorBoundary.title")}
                        </h1>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#64748b",
                                margin: "0 0 20px",
                                lineHeight: 1.5,
                            }}
                        >
                            {t("demo.errorBoundary.description")}
                        </p>
                        <button
                            type="button"
                            onClick={this.handleReload}
                            style={{
                                background: "#059669",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: 10,
                                padding: "10px 22px",
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            {t("demo.errorBoundary.reload")}
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default withTranslation()(ErrorBoundary);
