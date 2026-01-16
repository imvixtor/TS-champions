import { getImageUrl } from '../../../utils';
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, MapPin } from "lucide-react"

export const MatchCard = ({ match }: { match: any }) => {
    const isLive = match.status === 'LIVE';

    const date = new Date(match.matchDate);
    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    return (
        <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-primary/50 hover:border-l-primary overflow-hidden group">
            <CardContent className="p-4 sm:p-5">
                {/* Header: Info */}
                <div className="flex justify-between items-start text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
                    <Badge variant="secondary" className="rounded-sm font-normal">
                        {match.roundName || 'Vòng bảng'}
                    </Badge>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {dateStr}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.stadium || 'Sân vận động'}</span>
                    </div>
                </div>

                {/* Body: Teams & Score */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">

                    {/* HOME TEAM */}
                    <div className="flex-1 flex w-full md:w-auto items-center justify-end gap-3 md:gap-4">
                        <span className="font-bold text-lg md:text-xl text-right md:line-clamp-1">
                            {match.homeTeam}
                        </span>
                        <img
                            src={getImageUrl(match.homeLogo, 'https://placehold.co/60')}
                            className="w-10 h-10 md:w-12 md:h-12 object-contain"
                            alt="Home"
                        />
                    </div>

                    {/* SCORE BOARD */}
                    <div className="w-full md:w-auto min-w-[100px] flex flex-col items-center justify-center p-2 rounded-lg bg-muted/20 md:bg-transparent">
                        {match.status === 'SCHEDULED' ? (
                            <div className="text-center">
                                <span className="text-2xl font-black text-foreground tracking-tight">{timeStr}</span>
                                <Badge variant="outline" className="mt-1 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-50">Sắp đá</Badge>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className={`text-3xl font-black tabular-nums tracking-widest ${isLive ? 'text-destructive' : 'text-foreground'}`}>
                                    {match.homeScore} - {match.awayScore}
                                </div>
                                {isLive ? (
                                    <Badge variant="destructive" className="mt-1 animate-pulse">
                                        ● Trực tiếp
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="mt-1">
                                        Kết thúc
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* AWAY TEAM */}
                    <div className="flex-1 flex w-full md:w-auto items-center justify-start gap-3 md:gap-4">
                        <img
                            src={getImageUrl(match.awayLogo, 'https://placehold.co/60')}
                            className="w-10 h-10 md:w-12 md:h-12 object-contain"
                            alt="Away"
                        />
                        <span className="font-bold text-lg md:text-xl text-left md:line-clamp-1">
                            {match.awayTeam}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
