import React, { Component } from "react";
import { connect } from "react-redux";
import { hideMenu } from "../../statemanagement/app/AppStateManagement";
import axios from "axios";

class DialogFiles extends Component {
	constructor(props) {
		super(props);
		this.escFunction = this.escFunction.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.state = {
			dragOver: false,
      loading: false
		};
	}

	handleDragOver = (e) => {
		e.preventDefault();
		this.setState({ dragOver: true });
	};
	handleDragLeave = (e) => {
		e.preventDefault();
		this.setState({ dragOver: false });
	};

	handleDrop = (e) => {
		e.preventDefault();
		this.setState({ dragOver: false });
		const files = e.dataTransfer.files;
		this.handleFiles(files);
	};

	handleFileChange = (e) => {
		const files = e.target.files;
		this.handleFiles(files);
	};

	handleFiles = async (files) => {
    this.loading = true
    const formData = new FormData()
		for (const file of files) {
			console.log("File:", file.name);
      formData.append('video', file)
		}
    try {
      await axios.post("/files", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
      console.log('files recieved');
      this.props.onClose()
    } catch (error) {
      console.log('fetching error');
      console.log(error);
    } finally {
      this.loading = false
    }
	};

	escFunction(event) {
		if (event.keyCode === 27) {
			this.props.dispatch(hideMenu());
		}
	}

	componentDidMount() {
		document.addEventListener("keydown", this.escFunction, false);
		document.addEventListener("click", this.handleClick, false);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.escFunction, false);
		document.removeEventListener("click", this.handleClick, false);
	}

	handleClick(e) {
		if (this.node.contains(e.target)) {
			// click inside menu, do nothing
			return;
		}

		// Click outside, hide menu
		this.props.dispatch(hideMenu());
	}

	render() {
		const { dragOver } = this.state;
		const { visible, onClose } = this.props;

		return (
			<React.Fragment>
				<div ref={(node) => (this.node = node)} className="dialog">
					<div className="card">
						<p className="title">Добавить видео и разметку</p>
						<div className={`files ${dragOver ? "dragover" : ""}`} onDragOver={this.handleDragOver} onDragLeave={this.handleDragLeave} onDrop={this.handleDrop}>
							<input type="file" id="fileInput" accept="video/*,.json" multiple onChange={this.handleFileChange} />
							<label htmlFor="fileInput">+ Перетащите файлы сюда</label>
						</div>
						<div className="controls">
							<button className="btn" onClick={onClose}>
								Отмена
							</button>
							<button className="btn">Добавить</button>
						</div>
					</div>
				</div>
				<style jsx>{`
					.dialog {
						position: absolute;
						background-color: rgba(0, 0, 0, 0.2);
						width: 100%;
						height: 100%;
						top: 0;
						left: 0;
						display: flex;
						justify-content: center;
						align-items: center;
						z-index: 1000;
					}
					.title {
						font-size: 18px;
						font-weight: 600;
					}
					.card {
						width: 400px;
						padding: 20px;
						background-color: white;
					}
					.files {
						margin: 10px 0;
						display: flex;
						justify-content: center;
						align-items: center;
						height: 200px;
						border: 1px dashed gray;
						border-radius: 8px;
            transition: all .2s;
					}

          .dragover {
            border: border: 1px dashed rgb(0, 206, 209);
            background-color: rgba(0, 206, 209, 0.3);
          }
					#fileInput {
						display: none;
					}
					.controls {
						display: flex;
						justify-content: space-between;
					}
				`}</style>
			</React.Fragment>
		);
	}
}

export default connect((state) => {
	return {
		mode: state.app.get("mode"),
		userSettings: state.usersettings,
		uiSettings: state.app.get("uiSettings"),
		version: state.app.getIn(["config", "OPENDATACAM_VERSION"]),
	};
})(DialogFiles);
