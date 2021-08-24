import React from 'react'
import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native'
import { Audio } from 'expo-av'
import Icon from 'react-native-vector-icons/AntDesign';
import axios from 'axios'
import Loading from "./view/Loading"
import { thisStringValue } from 'es-abstract';

let httpUrl = 'https://kr.object.ncloudstorage.com/musicapp/';
var audioBookPlaylist = null;

export default class App extends React.Component {
	state = {
		isMenu: false,
		isPlaying: false,
		playbackInstance: null,
		currentIndex: 0,
		volume: 1.0,
		isBuffering: true,
		isList: false
	}

	async componentDidMount() {
		try {
			this.loadYoutube();
			await this.loadList();

			await Audio.setAudioModeAsync({
				allowsRecordingIOS: false,
				interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
				playsInSilentModeIOS: true,
				interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
				shouldDuckAndroid: true,
				staysActiveInBackground: true,
				playThroughEarpieceAndroid: true
			})
			
			this.loadAudio();
		} catch (e) {
			console.log(e)
		}
	}
	async loadYoutube(){
		const apiKey = "**";
	    const channelid = "UCI2uIodAJX8aKgfZNvGqBIw";
		const jeiuId = "UCH_kbGvUpMwBAl1NyX_c9XA";
		var url = "https://www.googleapis.com/youtube/v3/search";
		url+="?key="+apiKey;
		url+="&part=snippet";
		url+="&channelid="+jeiuId;
		url+="&type=video";
		console.log("=====youtube=====")
		await axios.get( url )
		.then(function (data) {
			console.log("=====youtube data =====")
			console.log( data )
			console.log("=====youtube data =====")
		})
		.catch(function (error) {
			console.log(error);
		});
	}

	async loadList(){
		await axios.get(httpUrl+'list.json')
		.then(function ({data}) {
			audioBookPlaylist = data;
		})
		.catch(function (error) {
			console.log(error);
		});
	}

	async loadAudio() {
		const { currentIndex, isPlaying, volume } = this.state

		try {
			const playbackInstance = new Audio.Sound()
			const source = {
				uri: audioBookPlaylist[currentIndex].uri
			}

			const status = {
				shouldPlay: isPlaying,
				volume: volume
			}

			playbackInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate)
			await playbackInstance.loadAsync(source, status, false)
			this.setState({
				playbackInstance,
				isMenu:true
			})
		} catch (e) {
			console.log(e)
		}
	}

	onPlaybackStatusUpdate = status => {
		this.setState({
			isBuffering: status.isBuffering
		})
	}

	handlePlayPause = async () => {
		const { isPlaying, playbackInstance } = this.state
		isPlaying ? await playbackInstance.pauseAsync() : await playbackInstance.playAsync()

		this.setState({
			isPlaying: !isPlaying
		})
	}

	handlePreviousTrack = async () => {
		let { playbackInstance, currentIndex } = this.state
		if (playbackInstance) {
			await playbackInstance.unloadAsync()
			this.setState({
				currentIndex : (currentIndex === 0 ? audioBookPlaylist.length -1 : currentIndex-1)
			});
			this.loadAudio()
		}
	}

	handleNextTrack = async () => {
		let { playbackInstance, currentIndex } = this.state
		if (playbackInstance) {
			await playbackInstance.unloadAsync()
			this.setState({
				currentIndex: (currentIndex+1 > audioBookPlaylist.length - 1 ? 0 : currentIndex+1)
			});
			this.loadAudio()
		}
	}
	renderFileImg(){
		const { playbackInstance, currentIndex } = this.state
		return playbackInstance ? (
			<View style={styles.trackInfo}>
				<Image
				style={styles.albumCover}
				source={{ uri: audioBookPlaylist[currentIndex].imageSource }}
				/>
			</View>
				
		) : null
	}
	renderFileInfo(){
		const { playbackInstance, currentIndex } = this.state
		return playbackInstance ? (
			<View style={styles.trackInfo}>
				<Text style={[styles.trackInfoText, styles.largeText]}>
					{audioBookPlaylist[currentIndex].title}
				</Text>
			</View>
		) : null
	}
	handelList(){
		const { isList } = this.state;
		this.setState({
			isList: !isList
		});
	}
	renderMusicList(){
		const {isList} = this.state;
		return !isList ? 
		(
			<TouchableOpacity style={styles.closeList} onPress={this.handelList.bind(this)}>
				<Icon name='minus' size={30} color='#444' />
			</TouchableOpacity>			
		):
		(
			<TouchableOpacity style={styles.musicList} onPress={this.handelList.bind(this)}>
				<Icon name='minus' size={30} color='#444' />
			</TouchableOpacity>
		)
	}
	render() {
		let {isMenu} = this.state;

		return !isMenu ? (<Loading/>) : (
			<View style={styles.container}>
				{this.renderFileImg()}
				<View style={styles.controls}>
					<TouchableOpacity style={styles.control} onPress={this.handlePreviousTrack}>
						<Icon name="banckward" size={48} /> 
					</TouchableOpacity>
					<TouchableOpacity style={styles.control} onPress={this.handlePlayPause}>
						{this.state.isPlaying ? (
							<Icon name='pausecircle' size={48} color='#444' />
						) : (
							<Icon name='play' size={48} color='#444' />
						)}
					</TouchableOpacity>
					<TouchableOpacity style={styles.control} onPress={this.handleNextTrack}>
						<Icon name="forward" size={48} /> 
					</TouchableOpacity>
				</View>
				{this.renderFileInfo()}
				{this.renderMusicList()}
			</View>
		)
		
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center'
	},
	controls: {
		flex:4,
		flexDirection: 'row'
	},
	control: {
		margin: 20
	},
	albumCover: {
		//width: 250,
		//height: 250
	},
	trackInfo: {
		flex:4,
		backgroundColor: '#fff'
	},
	trackInfoText: {	
		textAlign: 'center',
		flexWrap: 'wrap',
		color: '#550088'
	},
	musicList: {
		flex:4,
		width:"100%",
		borderTopLeftRadius:30,
		borderTopRightRadius:30,
		alignItems:"center",
		backgroundColor:"red"
	},
	closeList: {
		flex:1,
		width:"100%",
		borderTopLeftRadius:30,
		borderTopRightRadius:30,
		alignItems:"center",
		backgroundColor:"#d2d2d2"
	},
	largeText: {
		fontSize: 22
	},
	smallText: {
		fontSize: 16
	},
	

})
