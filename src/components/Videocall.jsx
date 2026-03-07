import { JitsiMeeting } from "@jitsi/react-sdk";

const VideoCall = ({ roomName, userName, onLeave }) => {

    return (

        <div className="w-full h-[75vh] rounded-xl overflow-hidden">

            <JitsiMeeting
                roomName={roomName}
                configOverwrite={{
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    disableModeratorIndicator: true,
                    startScreenSharing: false,
                    enableEmailInStats: false
                }}
                interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
                }}
                userInfo={{
                    displayName: userName
                }}
                onReadyToClose={() => {
                    if (onLeave) onLeave();
                }}
                getIFrameRef={(iframe) => {
                    iframe.style.height = "100%";
                    iframe.style.width = "100%";
                }}
            />

        </div>

    );

};

export default VideoCall;