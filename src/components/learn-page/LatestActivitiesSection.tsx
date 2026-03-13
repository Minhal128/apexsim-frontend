interface LatestActivitiesProps {
    onActivityClick: () => void;
}

const activities = [
    {
        title: "Top-up with $100 and get $30 in BTC",
        desc: "New users who top-up and trade enjoy a $30 BTC reward",
        date: "Jan 23",
        img: "/images/learnsection.png"
    },
    {
        title: "Top-up with $100 and get $30 in BTC",
        desc: "New users who top-up and trade enjoy a $30 BTC reward",
        date: "Jan 23",
        img: "/images/learnsection.png"
    },
    {
        title: "Top-up with $100 and get $30 in BTC",
        desc: "New users who top-up and trade enjoy a $30 BTC reward",
        date: "Jan 23",
        img: "/images/learnsection.png"
    },
    {
        title: "Top-up with $100 and get $30 in BTC",
        desc: "New users who top-up and trade enjoy a $30 BTC reward",
        date: "Jan 23",
        img: "/images/learnsection.png"
    }
];

export default function LatestActivities({ onActivityClick }: LatestActivitiesProps) {
    return (
        <div className="space-y-8">
            {activities.map((item, index) => (
                <div
                    key={index}
                    onClick={onActivityClick}
                    className="
                        flex flex-col sm:flex-row
                        items-center sm:items-center
                        gap-6
                        cursor-pointer group
                    "
                >
                    <div
                        className="
                            w-full sm:w-40
                            h-44 sm:h-32
                            px-3 sm:px-0
                        "
                    >
                        <div className="
                            w-full h-full
                            bg-[#222222]
                            rounded-sm
                            flex items-center justify-center
                            overflow-hidden md:p-3
                        ">
                            <img
                                src={item.img}
                                alt="Activity Icon"
                                className="
                                    w-full h-full
                                    object-contain
                                "
                            />
                        </div>
                    </div>

                    <div
                        className="
                            flex flex-col
                            items-center sm:items-start
                            text-center sm:text-left
                            space-y-4 sm:space-y-6
                            px-4 sm:px-0
                        "
                    >
                        <h3 className="text-lg sm:text-xl font-medium text-white leading-snug">
                            {item.title}
                        </h3>

                        <div className="
                            bg-[#222222]
                            text-gray-400
                            text-sm
                            px-4 py-2
                            rounded-lg
                            inline-block
                        ">
                            {item.desc}
                        </div>

                        <p className="text-gray-400 text-sm font-light">
                            {item.date}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
