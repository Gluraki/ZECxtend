export function ZECHeader() {
    return (
        <header className="mt-4 mb-8 px-4 grid grid-cols-3 items-center">
            <div className="flex justify-start">
                <img
                    src="/images/Logo_HTL_100.png"
                    alt="HTL Logo"
                    className="h-16 md:h-20 object-contain"
                />
            </div>
            <h1 className="text-center text-xl md:text-5xl font-bold tracking-tight text-blue-900">
                ZEC-Timing
            </h1>
            <div className="flex justify-end">
                <img
                    src="/images/ZEC-Logo.png"
                    alt="Zero Emission Challenge Logo"
                    className="h-16 md:h-20 object-contain"
                />
            </div>
        </header>
    )
}