import { JitsiMeeting } from "@jitsi/react-sdk";

const VideoCall = ({ roomName, userName, onLeave }) => {

    return (

        <div className="w-full flex flex-col gap-0 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">

            {/* Header Bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500">

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-white font-semibold text-sm">Live Consultation</span>
                    </div>
                    <span className="text-blue-200 text-xs hidden sm:block">| Room: {roomName}</span>
                </div>

                <button
                    onClick={onLeave}
                    className="flex items-center gap-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Leave Call
                </button>

            </div>

            {/* Jitsi SDK — This allows us to catch the "End Call" event inside Jitsi */}
            <div className="w-full h-[72vh] relative bg-gray-900">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={roomName}
                    configOverwrite={{
                        subject: "Tele-Consultation",
                        hideConferenceSubject: true,
                        hideConferenceTimer: true,
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        disableModeratorIndicator: true,
                        startScreenSharing: false,
                        enableEmailInStats: false,
                        prejoinPageEnabled: false,
                        prejoinConfig: { enabled: false },
                        enableLobbyChat: false,
                        // Prevent Jitsi from showing its own end-screen
                        enableClosePage: false,
                        doNotStoreRoom: true,
                    }}
                    interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        SHOW_JITSI_WATERMARK: false,
                        HIDE_DEEP_LINKING_LOGO: true,
                        SHOW_BRAND_WATERMARK: false,
                        SHOW_POWERED_BY: false,
                        AUTHENTICATION_ENABLE: false,
                    }}
                    userInfo={{
                        displayName: userName
                    }}
                    onApiReady={(externalApi) => {
                        // Attach listeners directly to the API object for maximum reliability
                        externalApi.addEventListener('videoConferenceLeft', () => {
                            if (onLeave) onLeave();
                        });
                        externalApi.addEventListener('readyToClose', () => {
                            if (onLeave) onLeave();
                        });
                    }}
                    onReadyToClose={() => {
                        if (onLeave) onLeave();
                    }}
                    getIFrameRef={(iframe) => {
                        iframe.style.height = "100%";
                        iframe.style.width = "100%";
                        iframe.style.border = "none";
                    }}
                />
            </div>

            {/* Status Footer */}
            <div className="px-5 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                    Encrypted Connection via Jitsi Meet
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">Connected as <strong>{userName}</strong></span>
                </div>
            </div>

        </div>

    );

};

export default VideoCall;