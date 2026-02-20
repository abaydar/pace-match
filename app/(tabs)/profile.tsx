import { HelloWave } from "@/components/hello-wave";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function Profile() {
    return (
        <ThemedView>
            <ThemedText>
                <HelloWave />
                This is the profile page
            </ThemedText>
        </ThemedView>
    )
}